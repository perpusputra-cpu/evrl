import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { WorkspaceState } from '../src/types';
import { createInitialWorkspaceState } from '../src/utils/sampleData';

const WORKSPACE_DIR = path.join(process.cwd(), '.data', 'workspaces');
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days of inactivity

// In-memory cache for speed + durability in files
const memoryStore = new Map<string, WorkspaceState>();

// Ensure directory exists
try {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
} catch {
  // Ignore filesystem errors in strict environments
}

export function generateSecureWorkspaceId(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `ws_${randomBytes}`;
}

export function signWorkspaceToken(workspaceId: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(workspaceId);
  const signature = hmac.digest('hex');
  return `${workspaceId}.${signature}`;
}

export function verifyWorkspaceToken(token: string, secret: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [workspaceId, signature] = parts;
  if (!workspaceId.startsWith('ws_')) return null;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(workspaceId);
  const expectedSignature = hmac.digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return workspaceId;
  }
  return null;
}

export function getWorkspaceFilePath(workspaceId: string): string {
  // Prevent path traversal
  const sanitizedId = workspaceId.replace(/[^a-zA-Z0-9_]/g, '');
  return path.join(WORKSPACE_DIR, `${sanitizedId}.json`);
}

export function getWorkspaceState(workspaceId: string): WorkspaceState | null {
  // 1. Check in-memory
  let state = memoryStore.get(workspaceId);

  // 2. Check filesystem if not in memory
  if (!state) {
    const filePath = getWorkspaceFilePath(workspaceId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        state = JSON.parse(raw) as WorkspaceState;
        memoryStore.set(workspaceId, state);
      } catch (e) {
        console.error(`Failed to read workspace file ${filePath}:`, e);
      }
    }
  }

  if (!state) return null;

  // Check version - if older version (version !== 2), reset to fresh authentic KTI
  if (!state.metadata.version || state.metadata.version < 2) {
    state = createInitialWorkspaceState(workspaceId);
    saveWorkspaceState(state);
    return state;
  }

  // 3. Inactivity check (7 days)
  const lastActive = new Date(state.metadata.lastActivityAt).getTime();
  const now = Date.now();
  if (now - lastActive > RETENTION_MS) {
    deleteWorkspace(workspaceId);
    return null;
  }

  return state;
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
  const now = new Date();
  state.metadata.lastActivityAt = now.toISOString();
  state.metadata.expiresAt = new Date(now.getTime() + RETENTION_MS).toISOString();

  // Save to memory
  memoryStore.set(state.metadata.id, state);

  // Save to filesystem asynchronously
  try {
    const filePath = getWorkspaceFilePath(state.metadata.id);
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write workspace file:', e);
  }
}

export function createNewWorkspace(customId?: string): WorkspaceState {
  const workspaceId = customId || generateSecureWorkspaceId();
  const state = createInitialWorkspaceState(workspaceId);
  saveWorkspaceState(state);
  return state;
}

export function deleteWorkspace(workspaceId: string): void {
  memoryStore.delete(workspaceId);
  try {
    const filePath = getWorkspaceFilePath(workspaceId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error(`Failed to delete workspace file for ${workspaceId}:`, e);
  }
}

export function cleanupExpiredWorkspaces(): number {
  let cleanedCount = 0;
  const now = Date.now();

  // Check memory
  for (const [id, state] of memoryStore.entries()) {
    const lastActive = new Date(state.metadata.lastActivityAt).getTime();
    if (now - lastActive > RETENTION_MS) {
      deleteWorkspace(id);
      cleanedCount++;
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

// Run cleanup every 6 hours
setInterval(() => {
  cleanupExpiredWorkspaces();
}, 6 * 60 * 60 * 1000);
