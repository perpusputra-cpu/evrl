import {
  ChatMessage,
  Experiment,
  JuryDifficulty,
  JuryPersonaId,
  JuryQuestion,
  JuryReport,
  JuryResponseEvaluation,
  JurySession,
  ReferenceItem,
  ResearchNote,
  WorkspaceState,
} from '../types';

let cachedWorkspaceId: string | null = null;

export function getCachedWorkspaceId(): string | null {
  if (cachedWorkspaceId) return cachedWorkspaceId;
  const stored = localStorage.getItem('evrl_workspace_id');
  if (stored) {
    cachedWorkspaceId = stored;
    return stored;
  }
  return null;
}

export function setCachedWorkspaceId(id: string) {
  cachedWorkspaceId = id;
  localStorage.setItem('evrl_workspace_id', id);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const wsId = getCachedWorkspaceId();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (wsId) {
    headers.set('x-workspace-id', wsId);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // for signed cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status} Error`);
  }

  return response.json();
}

export const api = {
  async initWorkspace(): Promise<{ success: boolean; workspaceId: string; state: WorkspaceState }> {
    const res = await request<{ success: boolean; workspaceId: string; state: WorkspaceState }>(
      '/api/workspace/init',
      { method: 'POST', body: JSON.stringify({}) }
    );
    if (res.workspaceId) {
      setCachedWorkspaceId(res.workspaceId);
    }
    return res;
  },

  async getWorkspaceState(): Promise<{ success: boolean; state: WorkspaceState }> {
    return request<{ success: boolean; state: WorkspaceState }>('/api/workspace/state');
  },

  async saveWorkspaceState(state: WorkspaceState): Promise<{ success: boolean; lastActivityAt: string }> {
    return request<{ success: boolean; lastActivityAt: string }>('/api/workspace/save', {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  },

  async loadSamplePreset(): Promise<{ success: boolean; state: WorkspaceState }> {
    return request<{ success: boolean; state: WorkspaceState }>('/api/workspace/load-sample', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  async resetWorkspace(): Promise<{ success: boolean; state: WorkspaceState; message: string }> {
    localStorage.removeItem('evrl_workspace_id');
    cachedWorkspaceId = null;
    return request<{ success: boolean; state: WorkspaceState; message: string }>('/api/workspace/reset', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  async heartbeat(): Promise<{ success: boolean; lastActivityAt: string; expiresAt: string }> {
    return request<{ success: boolean; lastActivityAt: string; expiresAt: string }>(
      '/api/workspace/heartbeat',
      { method: 'POST', body: JSON.stringify({}) }
    );
  },

  async createExperiment(experiment: Experiment): Promise<{ success: boolean; experiment: Experiment }> {
    return request<{ success: boolean; experiment: Experiment }>('/api/experiment/create', {
      method: 'POST',
      body: JSON.stringify({ experiment }),
    });
  },

  async updateExperiment(experiment: Experiment): Promise<{ success: boolean; experiment: Experiment }> {
    return request<{ success: boolean; experiment: Experiment }>(`/api/experiment/${experiment.id}`, {
      method: 'PUT',
      body: JSON.stringify({ experiment }),
    });
  },

  async deleteExperiment(experimentId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/experiment/${experimentId}`, {
      method: 'DELETE',
    });
  },

  async saveNote(note: ResearchNote): Promise<{ success: boolean; note: ResearchNote }> {
    return request<{ success: boolean; note: ResearchNote }>('/api/research/notes', {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  async deleteNote(noteId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/research/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  async saveReference(reference: ReferenceItem): Promise<{ success: boolean; reference: ReferenceItem }> {
    return request<{ success: boolean; reference: ReferenceItem }>('/api/research/references', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  },

  async deleteReference(referenceId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/research/references/${referenceId}`, {
      method: 'DELETE',
    });
  },

  async sendLabAiMessage(
    message: string,
    conversationId?: string | null,
    activeExpId?: string | null
  ): Promise<{ success: boolean; message: ChatMessage; conversation: any }> {
    return request<{ success: boolean; message: ChatMessage; conversation: any }>('/api/lab-ai', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, activeExpId }),
    });
  },

  async startJurySession(
    persona: JuryPersonaId,
    difficulty: JuryDifficulty,
    totalRounds: number = 4
  ): Promise<{ success: boolean; session: JurySession; question: JuryQuestion }> {
    return request<{ success: boolean; session: JurySession; question: JuryQuestion }>(
      '/api/jury/start',
      {
        method: 'POST',
        body: JSON.stringify({ persona, difficulty, totalRounds }),
      }
    );
  },

  async submitJuryAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{
    success: boolean;
    evaluation: JuryResponseEvaluation;
    nextQuestion?: JuryQuestion;
    isCompleted: boolean;
    finalReport?: JuryReport;
    session: JurySession;
  }> {
    return request<{
      success: boolean;
      evaluation: JuryResponseEvaluation;
      nextQuestion?: JuryQuestion;
      isCompleted: boolean;
      finalReport?: JuryReport;
      session: JurySession;
    }>('/api/jury/respond', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, answer }),
    });
  },
};
