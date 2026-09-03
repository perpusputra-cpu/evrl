import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  evaluateJuryAnswer,
  generateFinalJuryReport,
  generateJuryQuestion,
  getAiProviderInfo,
  handleLabAiQuery,
} from './server/aiProvider';
import { requireTurnstile, validateTurnstileToken } from './server/turnstile';
import {
  createNewWorkspace,
  generateSecureWorkspaceId,
  getWorkspaceState,
  saveWorkspaceState,
  signWorkspaceToken,
  verifyWorkspaceToken,
} from './server/workspaceStore';
import {
  ChatMessage,
  Experiment,
  JuryDifficulty,
  JuryPersonaId,
  JurySession,
  ReferenceItem,
  ResearchNote,
  WorkspaceState,
} from './src/types';
import { createSampleExperiments, SAMPLE_KTI } from './src/utils/sampleData';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SESSION_COOKIE_NAME = 'evrl_workspace_session';
const SESSION_SECRET =
  process.env.SESSION_SIGNING_SECRET || 'dev_secret_key_ecobrick_research_lab_2026';

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(SESSION_SECRET));

// Security & Isolation helper
function extractWorkspaceId(req: Request): string | null {
  // 1. From authorization / custom header (primary for client-side state sync)
  const authHeader = req.headers['x-workspace-id'] as string;
  if (authHeader && authHeader.startsWith('ws_')) {
    return authHeader;
  }

  // 2. From signed or raw cookie
  const cookieVal = req.signedCookies?.[SESSION_COOKIE_NAME] || req.cookies?.[SESSION_COOKIE_NAME];
  if (cookieVal) {
    const verified = verifyWorkspaceToken(cookieVal, SESSION_SECRET);
    if (verified) return verified;
  }

  return null;
}

function requireWorkspace(req: Request, res: Response, next: NextFunction) {
  const wsId = extractWorkspaceId(req);
  if (!wsId) {
    // If not found, create new on the fly to prevent disruption
    const newWs = createNewWorkspace();
    const token = signWorkspaceToken(newWs.metadata.id, SESSION_SECRET);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    (req as any).workspaceId = newWs.metadata.id;
    (req as any).workspaceState = newWs;
    return next();
  }

  let state = getWorkspaceState(wsId);
  if (!state) {
    state = createNewWorkspace(wsId);
  }

  (req as any).workspaceId = wsId;
  (req as any).workspaceState = state;
  next();
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ecobrick Virtual Research Laboratory API',
    time: new Date().toISOString(),
  });
});

app.get('/api/ai/provider-status', (req, res) => {
  res.json({
    success: true,
    ...getAiProviderInfo(),
  });
});

// Workspace Init
app.post('/api/workspace/init', (req, res) => {
  let wsId = extractWorkspaceId(req);
  let state: WorkspaceState;

  if (wsId) {
    const existing = getWorkspaceState(wsId);
    state = existing || createNewWorkspace(wsId);
  } else {
    state = createNewWorkspace();
    wsId = state.metadata.id;
  }

  const token = signWorkspaceToken(wsId, SESSION_SECRET);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.json({
    success: true,
    workspaceId: wsId,
    state,
  });
});

// Workspace Heartbeat (extends 7-day inactivity)
app.post('/api/workspace/heartbeat', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  saveWorkspaceState(state);
  res.json({
    success: true,
    lastActivityAt: state.metadata.lastActivityAt,
    expiresAt: state.metadata.expiresAt,
  });
});

// Fetch Current Workspace State
app.get('/api/workspace/state', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  res.json({
    success: true,
    state,
  });
});

// Save Entire Workspace State
app.post('/api/workspace/save', requireWorkspace, (req, res) => {
  const incoming = req.body.state as WorkspaceState;
  const currentWsId = (req as any).workspaceId as string;

  if (!incoming || !incoming.metadata || !incoming.metadata.id) {
    return res.status(400).json({ error: 'Mismatched or invalid workspace payload' });
  }

  // If the client sent a valid workspace state with an active ID, ensure it is saved and the session matches
  const targetId = incoming.metadata.id || currentWsId;
  incoming.metadata.id = targetId;

  saveWorkspaceState(incoming);

  // Update session cookie if needed
  if (targetId !== currentWsId) {
    const token = signWorkspaceToken(targetId, SESSION_SECRET);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000,
    });
  }

  res.json({ success: true, lastActivityAt: incoming.metadata.lastActivityAt, workspaceId: targetId });
});

// Reset / Load Sample Preset (Pristine authentic KTI state)
app.post('/api/workspace/load-sample', requireWorkspace, (req, res) => {
  const currentWsId = (req as any).workspaceId as string;
  const fresh = createNewWorkspace(currentWsId);
  res.json({ success: true, state: fresh });
});

// Full Wipe / Hard Reset Workspace
app.post('/api/workspace/reset', requireWorkspace, (req, res) => {
  const currentWsId = (req as any).workspaceId as string;
  const fresh = createNewWorkspace(currentWsId);
  saveWorkspaceState(fresh);
  res.json({ success: true, state: fresh, message: 'Semua data lama berhasil dibersihkan dan diatur ulang ke naskah KTI resmi.' });
});

// Experiments CRUD
app.post('/api/experiment/create', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const newExp = req.body.experiment as Experiment;

  if (!newExp) {
    return res.status(400).json({ error: 'Experiment data required' });
  }

  newExp.workspaceId = state.metadata.id;
  newExp.createdAt = new Date().toISOString();
  newExp.updatedAt = new Date().toISOString();

  state.experiments.push(newExp);
  state.activeExperimentId = newExp.id;
  saveWorkspaceState(state);

  res.json({ success: true, experiment: newExp });
});

app.put('/api/experiment/:id', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const expId = req.params.id;
  const updatedExp = req.body.experiment as Experiment;

  const idx = state.experiments.findIndex((e) => e.id === expId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Experiment not found' });
  }

  updatedExp.updatedAt = new Date().toISOString();
  state.experiments[idx] = updatedExp;
  saveWorkspaceState(state);

  res.json({ success: true, experiment: updatedExp });
});

app.delete('/api/experiment/:id', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const expId = req.params.id;

  state.experiments = state.experiments.filter((e) => e.id !== expId);
  if (state.activeExperimentId === expId) {
    state.activeExperimentId = state.experiments[0]?.id || null;
  }
  saveWorkspaceState(state);

  res.json({ success: true });
});

// References
app.post('/api/research/references', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const ref = req.body.reference as ReferenceItem;

  if (!ref) return res.status(400).json({ error: 'Reference data required' });

  ref.id = ref.id || `ref_${Date.now()}`;
  ref.workspaceId = state.metadata.id;
  ref.citationCode = ref.citationCode || `[REF-${String(state.references.length + 1).padStart(3, '0')}]`;
  ref.uploadedAt = new Date().toISOString();

  state.references.push(ref);
  saveWorkspaceState(state);

  res.json({ success: true, reference: ref });
});

app.delete('/api/research/references/:id', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  state.references = state.references.filter((r) => r.id !== req.params.id);
  saveWorkspaceState(state);
  res.json({ success: true });
});

// Research Notes
app.post('/api/research/notes', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const note = req.body.note as ResearchNote;

  if (!note) return res.status(400).json({ error: 'Note data required' });

  const idx = state.notes.findIndex((n) => n.id === note.id);
  note.workspaceId = state.metadata.id;
  note.updatedAt = new Date().toISOString();

  if (idx >= 0) {
    state.notes[idx] = note;
  } else {
    note.id = note.id || `note_${Date.now()}`;
    note.createdAt = new Date().toISOString();
    state.notes.unshift(note);
  }

  saveWorkspaceState(state);
  res.json({ success: true, note });
});

app.delete('/api/research/notes/:id', requireWorkspace, (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  state.notes = state.notes.filter((n) => n.id !== req.params.id);
  saveWorkspaceState(state);
  res.json({ success: true });
});

// LAB AI Chat (Standard JSON Endpoint - Protected by Turnstile)
app.post('/api/lab-ai', requireWorkspace, requireTurnstile('lab-ai'), async (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const { message, conversationId, activeExpId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Find or create conversation
    let conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = {
        id: conversationId || `conv_${Date.now()}`,
        workspaceId: state.metadata.id,
        title: message.slice(0, 45) + '...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        mode: 'ANALYST',
      };
      state.conversations.unshift(conv);
      state.activeConversationId = conv.id;
    }

    // 2. Append user message
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    conv.messages.push(userMsg);

    // 3. Process with LAB AI
    const assistantMsg = await handleLabAiQuery(
      state,
      message,
      conv.id,
      activeExpId || state.activeExperimentId
    );
    conv.messages.push(assistantMsg);
    conv.updatedAt = new Date().toISOString();

    saveWorkspaceState(state);

    res.json({
      success: true,
      message: assistantMsg,
      conversation: conv,
    });
  } catch (error) {
    console.error('Error handling LAB AI request:', error);
    res.status(500).json({
      error: 'LAB AI sedang tidak tersedia. Data eksperimen Anda tetap aman.',
    });
  }
});

// Static Developer-Managed Research Corpus Endpoint (Read-Only)
app.get('/api/research/corpus', (req, res) => {
  try {
    const ktiPath = path.join(process.cwd(), 'research', 'kti', 'kti-final.json');
    const citPath = path.join(process.cwd(), 'research', 'citations', 'citations.json');
    const methPath = path.join(process.cwd(), 'research', 'methodology', 'methodology.json');
    const rubPath = path.join(process.cwd(), 'research', 'jury', 'brida-rubric.json');

    const kti = fs.existsSync(ktiPath) ? JSON.parse(fs.readFileSync(ktiPath, 'utf-8')) : null;
    const citations = fs.existsSync(citPath) ? JSON.parse(fs.readFileSync(citPath, 'utf-8')) : [];
    const methodology = fs.existsSync(methPath) ? JSON.parse(fs.readFileSync(methPath, 'utf-8')) : null;
    const rubric = fs.existsSync(rubPath) ? JSON.parse(fs.readFileSync(rubPath, 'utf-8')) : null;

    res.json({
      success: true,
      corpus: {
        kti,
        citations,
        methodology,
        rubric,
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Gagal memuat korpus riset statis.' });
  }
});

// Jury Simulator Endpoints (Protected by Turnstile)
app.post('/api/jury/start', requireWorkspace, requireTurnstile('jury-start'), async (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const { persona = 'methodology', difficulty = 'COMPETITIVE', totalRounds = 4 } = req.body;

  try {
    const openingQuestion = await generateJuryQuestion(
      state,
      persona as JuryPersonaId,
      difficulty as JuryDifficulty,
      1
    );

    const session: JurySession = {
      id: `jury_${Date.now()}`,
      workspaceId: state.metadata.id,
      persona: persona as JuryPersonaId,
      difficulty: difficulty as JuryDifficulty,
      currentRound: 1,
      totalRounds: Number(totalRounds) || 4,
      status: 'IN_PROGRESS',
      questions: [openingQuestion],
      evaluations: [],
      startedAt: new Date().toISOString(),
    };

    state.jurySessions.unshift(session);
    state.activeJurySessionId = session.id;
    saveWorkspaceState(state);

    res.json({ success: true, session, question: openingQuestion });
  } catch (e) {
    console.error('Error starting jury session:', e);
    res.status(500).json({ error: 'Gagal memulai simulasi dewan juri.' });
  }
});

app.post('/api/jury/respond', requireWorkspace, requireTurnstile('jury-respond'), async (req, res) => {
  const state = (req as any).workspaceState as WorkspaceState;
  const { sessionId, questionId, answer } = req.body;

  const session = state.jurySessions.find((s) => s.id === sessionId);
  if (!session || session.status === 'COMPLETED') {
    return res.status(404).json({ error: 'Sesi juri tidak ditemukan atau sudah selesai.' });
  }

  const question = session.questions.find((q) => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Pertanyaan juri tidak valid.' });
  }

  try {
    // Evaluate defense answer
    const evaluation = await evaluateJuryAnswer(state, question, answer, session.difficulty);
    session.evaluations.push(evaluation);

    // Check if more rounds needed
    if (session.currentRound < session.totalRounds) {
      session.currentRound += 1;
      const nextQuestion = await generateJuryQuestion(
        state,
        session.persona,
        session.difficulty,
        session.currentRound,
        session.evaluations
      );
      session.questions.push(nextQuestion);
      saveWorkspaceState(state);

      res.json({
        success: true,
        evaluation,
        nextQuestion,
        isCompleted: false,
        session,
      });
    } else {
      // Finalize and generate final defense report
      session.status = 'COMPLETED';
      session.endedAt = new Date().toISOString();
      session.finalReport = await generateFinalJuryReport(
        state,
        session.evaluations,
        session.questions
      );
      saveWorkspaceState(state);

      res.json({
        success: true,
        evaluation,
        isCompleted: true,
        finalReport: session.finalReport,
        session,
      });
    }
  } catch (e) {
    console.error('Error evaluating jury response:', e);
    res.status(500).json({ error: 'Gagal mengevaluasi jawaban pertahanan.' });
  }
});

// Cloudflare Turnstile Verification Endpoint
app.post('/api/turnstile/verify', async (req, res) => {
  const token =
    (req.headers['x-turnstile-token'] as string) ||
    req.body?.token ||
    req.body?.turnstileToken ||
    req.body?.turnstile_token;

  const forwarded = req.headers['x-forwarded-for'];
  const remoteIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress;

  const outcome = await validateTurnstileToken(token, remoteIp);
  if (!outcome.success) {
    return res.status(403).json(outcome);
  }
  res.json(outcome);
});

// ReCAPTCHA Verification Endpoint (Legacy fallback)
app.post('/api/recaptcha/verify', async (req, res) => {
  const { token } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // If not configured in development, bypass safely
    return res.json({ success: true, bypassed: true });
  }

  try {
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );
    const data = await verifyRes.json();
    res.json({ success: data.success, score: data.score });
  } catch (e) {
    console.error('ReCAPTCHA verification failed:', e);
    res.status(500).json({ error: 'ReCAPTCHA verification error' });
  }
});

// Global Express Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[EVRL Server Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Terjadi kesalahan internal pada server laboratorium.',
    details: process.env.NODE_ENV !== 'production' ? err?.message : undefined,
  });
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[EVRL] Ecobrick Virtual Research Lab server listening at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('[EVRL] Critical error during server startup:', error);
    process.exit(1);
  }
}

export { app };
export default app;

// In Vercel serverless environment, the app is exported and invoked by Vercel functions,
// so app.listen is only called in non-Vercel container / standalone dev environments.
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[EVRL] Unhandled startServer rejection:', err);
  });
}

