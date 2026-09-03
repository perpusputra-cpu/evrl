import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header, NavTab } from './components/layout/Header';
import { LandingPage } from './components/landing/LandingPage';
import { VirtualLab } from './components/lab/VirtualLab';
import { ExperimentTimeline } from './components/experiments/ExperimentTimeline';
import { ResearchWorkspace } from './components/research/ResearchWorkspace';
import { LabAiChat } from './components/ai/LabAiChat';
import { JurySimulator } from './components/jury/JurySimulator';
import {
  ChatMessage,
  Conversation,
  Experiment,
  JuryDifficulty,
  JuryPersonaId,
  KTIStructure,
  ReferenceItem,
  ResearchNote,
  WorkspaceState,
} from './types';
import { api } from './services/api';
import { createSampleExperiments, SAMPLE_KTI, SAMPLE_REFERENCES } from './utils/sampleData';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAiSending, setIsAiSending] = useState<boolean>(false);
  const [isJuryProcessing, setIsJuryProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Initialize Workspace from Server or Local Sample
  const initializeWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await api.initWorkspace();
      if (res.success && res.state) {
        setWorkspace(res.state);
      }
    } catch (err: any) {
      console.warn('Could not connect to workspace API, using local offline fallback:', err);
      // Create local fallback workspace state
      const fallbackState: WorkspaceState = {
        metadata: {
          id: `ws_offline_${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          version: 1,
          title: 'Workspace Riset Ecobrick EVRL',
          primaryResearchTitle: SAMPLE_KTI.title,
        },
        experiments: createSampleExperiments(`ws_offline_${Date.now()}`),
        activeExperimentId: `exp_001`,
        kti: SAMPLE_KTI,
        references: SAMPLE_REFERENCES,
        notes: [],
        conversations: [],
        activeConversationId: null,
        jurySessions: [],
        activeJurySessionId: null,
      };
      setWorkspace(fallbackState);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeWorkspace();
  }, []);

  // Autosave workspace with 800ms debounce
  const debouncedSave = useCallback((stateToSave: WorkspaceState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveWorkspaceState(stateToSave);
        setSaveStatus('saved');
      } catch (e) {
        console.error('Autosave failed:', e);
        setSaveStatus('error');
      }
    }, 800);
  }, []);

  const updateWorkspaceState = useCallback(
    (updater: (prev: WorkspaceState) => WorkspaceState) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        updated.metadata.lastActivityAt = new Date().toISOString();
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  // Periodic Heartbeat every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      api.heartbeat().catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load Sample Data Action
  const handleLoadSamplePreset = async () => {
    setIsLoading(true);
    try {
      const res = await api.loadSamplePreset();
      if (res.success && res.state) {
        setWorkspace(res.state);
        setSaveStatus('saved');
        setActiveTab('lab');
      }
    } catch (e) {
      console.error('Failed to load sample preset:', e);
      initializeWorkspace();
    } finally {
      setIsLoading(false);
    }
  };

  // Hard Reset / Wipe All Data Action
  const handleResetAllData = async () => {
    setIsLoading(true);
    try {
      const res = await api.resetWorkspace();
      if (res.success && res.state) {
        setWorkspace(res.state);
        setSaveStatus('saved');
        setActiveTab('research');
      }
    } catch (e) {
      console.error('Failed to reset workspace:', e);
      // Fallback local reset
      localStorage.clear();
      initializeWorkspace();
    } finally {
      setIsLoading(false);
    }
  };

  // Active Experiment handlers
  const activeExp =
    workspace?.experiments.find((e) => e.id === workspace.activeExperimentId) ||
    workspace?.experiments[0];

  const handleUpdateExperiment = (exp: Experiment) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((e) => (e.id === exp.id ? exp : e)),
    }));
  };

  const handleCreateNewExperiment = () => {
    if (!workspace) return;
    const nextTrialNum = workspace.experiments.length + 1;
    const newExp: Experiment = {
      id: `exp_${Date.now()}`,
      workspaceId: workspace.metadata.id,
      trialNumber: nextTrialNum,
      title: `Eksperimen Trial #${nextTrialNum} - Formulasi Lanjutan`,
      objective: `Pengujian variasi rasio pemadatan plastik untuk meningkatkan densitas struktural.`,
      hypothesis: `Peningkatan rasio pemadatan bertahap akan meningkatkan densitas ecobrick melebihi 0.37 g/cm3.`,
      bottle: workspace.experiments[0]?.bottle || {
        id: 'bot_600',
        name: 'Botol PET Air Mineral 600ml',
        nominalVolume: 600,
        height: 23.5,
        diameter: 6.5,
        tareWeight: 18.0,
      },
      status: 'PREPARING',
      stickCompressionCycles: 0,
      materials: [],
      variables: [
        {
          id: `var_${Date.now()}_1`,
          type: 'INDEPENDENT',
          name: 'Fraksi Polimer',
          description: 'Jenis dan komposisi plastik',
          valueOrUnit: 'Campuran BOPP / LDPE',
        },
        {
          id: `var_${Date.now()}_2`,
          type: 'DEPENDENT',
          name: 'Densitas Akhir',
          description: 'Massa per volume',
          valueOrUnit: 'g/cm³',
        },
        {
          id: `var_${Date.now()}_3`,
          type: 'CONTROLLED',
          name: 'Spesifikasi Botol',
          description: 'Volume dan dimensi botol PET',
          valueOrUnit: '600 ml',
        },
      ],
      observations: [],
      measurements: [],
      procedureSteps: [
        '1. Bersihkan dan keringkan botol PET serta fraksi plastik.',
        '2. Timbang tara botol kosong pada neraca digital.',
        '3. Masukkan lapisan dasar plastik fleksibel dan tekan ke sudut dasar.',
        '4. Masukkan cacahan plastik bertahap per 20-30 gram dan padatkan dengan tongkat.',
        '5. Timbang massa kotor akhir dan hitung densitas.',
      ],
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateWorkspaceState((prev) => ({
      ...prev,
      experiments: [...prev.experiments, newExp],
      activeExperimentId: newExp.id,
    }));
    setActiveTab('lab');
  };

  const handleDeleteExperiment = (expId: string) => {
    updateWorkspaceState((prev) => {
      const filtered = prev.experiments.filter((e) => e.id !== expId);
      return {
        ...prev,
        experiments: filtered,
        activeExperimentId: prev.activeExperimentId === expId ? filtered[0]?.id || null : prev.activeExperimentId,
      };
    });
  };

  const handleSelectExperiment = (expId: string) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      activeExperimentId: expId,
    }));
  };

  // KTI Handlers
  const handleUpdateKTI = (updatedKTI: KTIStructure) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      kti: updatedKTI,
    }));
  };

  // Notes & Reference Handlers
  const handleSaveNote = (note: ResearchNote) => {
    updateWorkspaceState((prev) => {
      const idx = prev.notes.findIndex((n) => n.id === note.id);
      let updatedNotes = [...prev.notes];
      if (idx >= 0) {
        updatedNotes[idx] = note;
      } else {
        updatedNotes.unshift(note);
      }
      return { ...prev, notes: updatedNotes };
    });
  };

  const handleDeleteNote = (noteId: string) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  const handleSaveReference = (ref: ReferenceItem) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      references: [...prev.references, ref],
    }));
  };

  const handleDeleteReference = (refId: string) => {
    updateWorkspaceState((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== refId),
    }));
  };

  // LAB AI Message Dispatcher
  const activeConversation =
    workspace?.conversations.find((c) => c.id === workspace.activeConversationId) ||
    workspace?.conversations[0];

  const handleSendAiMessage = async (messageText: string, turnstileToken?: string) => {
    if (!workspace) return;
    setIsAiSending(true);

    const tempUserMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update conversation with user message immediately
    updateWorkspaceState((prev) => {
      let convs = [...prev.conversations];
      let cIdx = convs.findIndex((c) => c.id === prev.activeConversationId);
      if (cIdx >= 0) {
        convs[cIdx] = {
          ...convs[cIdx],
          messages: [...convs[cIdx].messages, tempUserMsg],
          updatedAt: new Date().toISOString(),
        };
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          workspaceId: prev.metadata.id,
          title: messageText.slice(0, 40) + '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [tempUserMsg],
          mode: 'ANALYST',
        };
        convs.unshift(newConv);
      }
      return {
        ...prev,
        conversations: convs,
        activeConversationId: convs[0].id,
      };
    });

    try {
      const res = await api.sendLabAiMessage(
        messageText,
        workspace.activeConversationId,
        workspace.activeExperimentId,
        turnstileToken
      );

      if (res.success && res.message) {
        updateWorkspaceState((prev) => {
          let convs = [...prev.conversations];
          if (res.conversation && res.conversation.messages && res.conversation.messages.length > 0) {
            const cIdx = convs.findIndex((c) => c.id === res.conversation.id || c.id === prev.activeConversationId);
            if (cIdx >= 0) {
              convs[cIdx] = res.conversation;
            } else {
              convs.unshift(res.conversation);
            }
          } else {
            let cIdx = convs.findIndex((c) => c.id === prev.activeConversationId);
            if (cIdx >= 0) {
              convs[cIdx] = {
                ...convs[cIdx],
                messages: [...convs[cIdx].messages, res.message],
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return {
            ...prev,
            conversations: convs,
            activeConversationId: res.conversation?.id || prev.activeConversationId || convs[0]?.id,
          };
        });
      }
    } catch (err: any) {
      console.error('Error in AI message handler:', err);
      const isTurnstileErr =
        err?.status === 403 ||
        err?.code === 'TURNSTILE_REQUIRED' ||
        err?.code === 'TURNSTILE_FORBIDDEN';

      const errorText = isTurnstileErr
        ? '🛡️ Verifikasi Cloudflare Turnstile diperlukan atau telah kedaluwarsa. Silakan centang kotak verifikasi keamanan sebelum mengirim pesan.'
        : '⚠️ Maaf, layanan AI sedang mengalami kendala. Data laboratorium dan naskah KTI Anda tetap aman. Silakan ulangi pertanyaan Anda.';

      // Append error message to UI
      updateWorkspaceState((prev) => {
        let convs = [...prev.conversations];
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: errorText,
          createdAt: new Date().toISOString(),
          inferenceType: 'SCIENTIFIC_INFERENCE',
        };
        if (convs.length > 0) {
          convs[0] = {
            ...convs[0],
            messages: [...convs[0].messages, errorMsg],
          };
        }
        return { ...prev, conversations: convs };
      });
    } finally {
      setIsAiSending(false);
    }
  };

  const handleClearConversation = () => {
    updateWorkspaceState((prev) => {
      const freshConv: Conversation = {
        id: `conv_${Date.now()}`,
        workspaceId: prev.metadata.id,
        title: 'Konsultasi Riset Baru',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        mode: 'ANALYST',
      };
      return {
        ...prev,
        conversations: [freshConv, ...prev.conversations.filter((c) => c.id !== prev.activeConversationId)],
        activeConversationId: freshConv.id,
      };
    });
  };

  const handleConsultAiFromExternal = (prompt: string) => {
    setActiveTab('ai');
    handleSendAiMessage(prompt);
  };

  // Jury Simulator Handlers
  const activeJurySession =
    workspace?.jurySessions.find((s) => s.id === workspace.activeJurySessionId) ||
    workspace?.jurySessions[0];

  const handleStartJurySession = async (
    persona: JuryPersonaId,
    difficulty: JuryDifficulty,
    rounds: number,
    turnstileToken?: string
  ) => {
    setIsJuryProcessing(true);
    try {
      const res = await api.startJurySession(persona, difficulty, rounds, turnstileToken);
      if (res.success && res.session) {
        updateWorkspaceState((prev) => ({
          ...prev,
          jurySessions: [res.session, ...prev.jurySessions],
          activeJurySessionId: res.session.id,
        }));
      }
    } catch (err: any) {
      console.error('Error starting jury session:', err);
      if (err?.status === 403) {
        alert('🛡️ Verifikasi Cloudflare Turnstile diperlukan atau gagal. Silakan verifikasi tantangan keamanan.');
      }
    } finally {
      setIsJuryProcessing(false);
    }
  };

  const handleSubmitJuryAnswer = async (
    sessionId: string,
    questionId: string,
    answer: string,
    turnstileToken?: string
  ) => {
    setIsJuryProcessing(true);
    try {
      const res = await api.submitJuryAnswer(sessionId, questionId, answer, turnstileToken);
      if (res.success && res.session) {
        updateWorkspaceState((prev) => ({
          ...prev,
          jurySessions: prev.jurySessions.map((s) => (s.id === sessionId ? res.session : s)),
        }));
      }
    } catch (err: any) {
      console.error('Error submitting jury defense answer:', err);
      if (err?.status === 403) {
        alert('🛡️ Verifikasi Cloudflare Turnstile diperlukan atau telah kedaluwarsa. Silakan verifikasi ulang.');
      }
    } finally {
      setIsJuryProcessing(false);
    }
  };

  if (isLoading && !workspace) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-mono text-stone-400">
          Menginisialisasi Ecobrick Virtual Research Laboratory...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] flex flex-col font-sans selection:bg-emerald-900/60 selection:text-emerald-200">
      {/* Top Application Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        metadata={workspace?.metadata}
        saveStatus={saveStatus}
        onLoadSample={handleLoadSamplePreset}
        onResetAllData={handleResetAllData}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterLab={() => setActiveTab('lab')}
            onLoadSample={handleLoadSamplePreset}
            onOpenTab={setActiveTab}
          />
        )}

        {activeTab === 'lab' && activeExp && workspace && (
          <VirtualLab
            experiment={activeExp}
            onUpdateExperiment={handleUpdateExperiment}
            onSaveExperiment={() => debouncedSave(workspace)}
            onGoToAiAnalysis={(expId) => {
              handleSelectExperiment(expId);
              setActiveTab('ai');
            }}
            allExperiments={workspace.experiments}
            onSelectExperiment={handleSelectExperiment}
            onCreateNewExperiment={handleCreateNewExperiment}
          />
        )}

        {activeTab === 'experiments' && workspace && (
          <ExperimentTimeline
            experiments={workspace.experiments}
            activeExperimentId={workspace.activeExperimentId}
            onSelectExperiment={(id) => {
              handleSelectExperiment(id);
              setActiveTab('lab');
            }}
            onDeleteExperiment={handleDeleteExperiment}
            onConsultAi={handleConsultAiFromExternal}
          />
        )}

        {activeTab === 'research' && workspace && (
          <ResearchWorkspace
            kti={workspace.kti}
            onUpdateKTI={handleUpdateKTI}
            notes={workspace.notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            references={workspace.references}
            onSaveReference={handleSaveReference}
            onDeleteReference={handleDeleteReference}
            onConsultAi={handleConsultAiFromExternal}
          />
        )}

        {activeTab === 'ai' && workspace && activeExp && (
          <LabAiChat
            conversation={activeConversation}
            onSendMessage={handleSendAiMessage}
            onClearConversation={handleClearConversation}
            isSending={isAiSending}
            activeExperiment={activeExp}
            kti={workspace.kti}
            references={workspace.references}
            onSaveToNotes={(title, content) => {
              handleSaveNote({
                id: `note_${Date.now()}`,
                workspaceId: workspace.metadata.id,
                title,
                content,
                tags: ['LAB AI', 'Insight'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }}
            onGoToJury={() => setActiveTab('jury')}
          />
        )}

        {activeTab === 'jury' && workspace && (
          <JurySimulator
            workspace={workspace}
            activeSession={activeJurySession}
            onStartSession={handleStartJurySession}
            onSubmitAnswer={handleSubmitJuryAnswer}
            isProcessing={isJuryProcessing}
            onGoToLab={() => setActiveTab('lab')}
          />
        )}
      </main>

      {/* Global Minimalist Bento Footer */}
      <footer className="border-t border-[#1C1C1C] bg-[#0A0A0A] py-4 px-4 sm:px-8 text-stone-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-200">EVRL v2.4</span>
            <span className="text-stone-600">•</span>
            <span className="text-emerald-400">Standar Global Ecobrick Alliance (GEA)</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Karya Tulis Ilmiah & Virtual Polymer Laboratory
          </div>
        </div>
      </footer>
    </div>
  );
}
