import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { WorkspaceState } from '../src/types';
import { createInitialWorkspaceState } from '../src/utils/sampleData';

// Determine writable directory for workspace storage:
// On Vercel / AWS Lambda, process.cwd() is read-only (/var/task). Only /tmp (os.tmpdir()) is writable.
function getWritableDirectory(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'evrl_workspaces');
  }
  return path.join(process.cwd(), '.data', 'workspaces');
}

const WORKSPACE_DIR = getWritableDirectory();
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days of inactivity

// In-memory cache for speed + durability in files
const memoryStore = new Map<string, WorkspaceState>();

// Safe directory initialization
try {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
} catch {
  // Ignore filesystem errors in strict or read-only environments; memoryStore remains functional
}

export function generateSecureWorkspaceId(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `ws_${randomBytes}`;
}

export function signWorkspaceToken(workspaceId: string, secret?: string): string {
  const signingKey =
    secret ||
    process.env.SESSION_SIGNING_SECRET ||
    process.env.SESSION_SECRET ||
    'dev_secret_key_ecobrick_research_lab_2026';
  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(workspaceId);
  const signature = hmac.digest('hex');
  return `${workspaceId}.${signature}`;
}

export function verifyWorkspaceToken(token: string, secret?: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [workspaceId, signature] = parts;
  if (!workspaceId || !workspaceId.startsWith('ws_') || !signature) return null;

  try {
    const signingKey =
      secret ||
      process.env.SESSION_SIGNING_SECRET ||
      process.env.SESSION_SECRET ||
      'dev_secret_key_ecobrick_research_lab_2026';
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(workspaceId);
    const expectedSignature = hmac.digest('hex');

    const sigBuf = Buffer.from(signature, 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');

    // timingSafeEqual throws RangeError if buffer lengths differ
    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return workspaceId;
    }
  } catch {
    // Malformed token or timing comparison error - safely treat as invalid
    return null;
  }
  return null;
}

export function getWorkspaceFilePath(workspaceId: string): string {
  // Prevent path traversal
  const sanitizedId = workspaceId.replace(/[^a-zA-Z0-9_]/g, '');
  return path.join(WORKSPACE_DIR, `${sanitizedId}.json`);
}

export function getWorkspaceState(workspaceId: string): WorkspaceState | null {
  if (!workspaceId || typeof workspaceId !== 'string' || !workspaceId.startsWith('ws_')) {
    return null;
  }

  try {
    // 1. Check in-memory
    let state = memoryStore.get(workspaceId);

    // 2. Check filesystem if not in memory
    if (!state) {
      try {
        const filePath = getWorkspaceFilePath(workspaceId);
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw) as WorkspaceState;
          if (parsed && parsed.metadata && parsed.metadata.id) {
            state = parsed;
            memoryStore.set(workspaceId, state);
          }
        }
      } catch (fileErr) {
        // Warning only, do not throw
        console.warn(`[EVRL Storage] Could not read workspace file for ${workspaceId}`);
      }
    }

    if (!state || !state.metadata) return null;

    // Check version - if older version (version !== 2), reset to fresh authentic KTI
    if (!state.metadata.version || state.metadata.version < 2) {
      state = createInitialWorkspaceState(workspaceId);
      saveWorkspaceState(state);
      return state;
    }

    // 3. Inactivity check (7 days)
    const lastActive = state.metadata.lastActivityAt
      ? new Date(state.metadata.lastActivityAt).getTime()
      : 0;
    const now = Date.now();
    if (lastActive && now - lastActive > RETENTION_MS) {
      deleteWorkspace(workspaceId);
      return null;
    }

    return state;
  } catch (err) {
    console.error(`[EVRL Storage] Error in getWorkspaceState for ${workspaceId}:`, (err as any)?.message);
    return null;
  }
}

export function resetAllWorkspaces(): void {
  memoryStore.clear();
  try {
    if (fs.existsSync(WORKSPACE_DIR)) {
      const files = fs.readdirSync(WORKSPACE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(WORKSPACE_DIR, file));
        }
      }
    }
  } catch (e) {
    console.error('Failed to reset all workspace files:', e);
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  try {
    if (!state || !state.metadata || !state.metadata.id) return;

    const now = new Date();
    state.metadata.lastActivityAt = now.toISOString();
    state.metadata.expiresAt = new Date(now.getTime() + RETENTION_MS).toISOString();

    // Save to memory
    memoryStore.set(state.metadata.id, state);

    // Save to filesystem if writable
    try {
      if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
      }
      const filePath = getWorkspaceFilePath(state.metadata.id);
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch {
      // Non-fatal on serverless; in-memory store retains state for invocation
    }
  } catch (err) {
    console.error('[EVRL Storage] Error in saveWorkspaceState:', (err as any)?.message);
  }
}

export function createNewWorkspace(customId?: string): WorkspaceState {
  try {
    const workspaceId =
      customId && customId.startsWith('ws_') ? customId : generateSecureWorkspaceId();
    const state = createInitialWorkspaceState(workspaceId);
    saveWorkspaceState(state);
    return state;
  } catch (err) {
    console.error('[EVRL Storage] Error in createNewWorkspace:', (err as any)?.message);
    const fallbackId = generateSecureWorkspaceId();
    return createInitialWorkspaceState(fallbackId);
  }
}

export function deleteWorkspace(workspaceId: string): void {
  try {
    memoryStore.delete(workspaceId);
    const filePath = getWorkspaceFilePath(workspaceId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Non-fatal
  }
}

export function cleanupExpiredWorkspaces(): number {
  let cleanedCount = 0;
  const now = Date.now();

  // Check memory
  for (const [id, state] of memoryStore.entries()) {
    try {
      const lastActive = state.metadata?.lastActivityAt
        ? new Date(state.metadata.lastActivityAt).getTime()
        : 0;
      if (lastActive && now - lastActive > RETENTION_MS) {
        deleteWorkspace(id);
        cleanedCount++;
      }
    } catch {
      // Ignore invalid entry
    }
  }

  // Check files
  try {
    if (fs.existsSync(WORKSPACE_DIR)) {
      const files = fs.readdirSync(WORKSPACE_DIR);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(WORKSPACE_DIR, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content) as WorkspaceState;
          if (data?.metadata?.lastActivityAt) {
            const lastActive = new Date(data.metadata.lastActivityAt).getTime();
            if (now - lastActive > RETENTION_MS) {
              fs.unlinkSync(filePath);
              cleanedCount++;
            }
          }
        } catch {
          // Ignore invalid file
        }
      }
    }
  } catch (e) {
    console.error('Error during workspace cleanup:', e);
  }

  return cleanedCount;
}

// Run periodic cleanup only in persistent Node processes (not on Vercel or AWS Lambda)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const cleanupTimer = setInterval(() => {
    try {
      cleanupExpiredWorkspaces();
    } catch (e) {
      console.error('[EVRL Storage] Cleanup error:', e);
    }
  }, 6 * 60 * 60 * 1000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}
