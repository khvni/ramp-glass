import {
  createDefaultWorkspacePreferences,
  type LayoutState,
  type LayoutStore,
  type WorkspacePreferences,
} from '@tinker/shared-types';
import { getDatabase } from './database.js';

export type LayoutRow = {
  version: number;
  workspace_state_json: string | null;
  updated_at: string;
};

export const CURRENT_LAYOUT_VERSION = 2 as const;

type StoredLayoutPayload = {
  workspace: LayoutState['workspace'];
  preferences?: unknown;
};

const parseJsonObject = (raw: string | null): Record<string, unknown> | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const isWorkspaceState = (value: unknown): value is LayoutState['workspace'] => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.version === CURRENT_LAYOUT_VERSION && Array.isArray(candidate.tabs);
};

const normalizePreferences = (value: unknown): WorkspacePreferences => {
  if (!value || typeof value !== 'object') {
    return createDefaultWorkspacePreferences();
  }

  const candidate = value as Record<string, unknown>;
  return {
    autoOpenAgentWrittenFiles:
      typeof candidate.autoOpenAgentWrittenFiles === 'boolean'
        ? candidate.autoOpenAgentWrittenFiles
        : createDefaultWorkspacePreferences().autoOpenAgentWrittenFiles,
  };
};

export const serializeLayoutState = (state: LayoutState): string => {
  const payload: StoredLayoutPayload = {
    workspace: state.workspace,
    preferences: state.preferences,
  };

  return JSON.stringify(payload);
};

export const hydrateLayoutRow = (row: LayoutRow | undefined, userId: string): LayoutState | null => {
  if (!row) {
    return null;
  }

  if (row.version !== CURRENT_LAYOUT_VERSION) {
    console.warn(
      `Ignoring stored layout for user ${userId}: version ${row.version} is not compatible with app version ${CURRENT_LAYOUT_VERSION}.`,
    );
    return null;
  }

  const payload = parseJsonObject(row.workspace_state_json);
  if (!payload) {
    console.warn(`Ignoring stored layout for user ${userId}: payload was not valid JSON.`);
    return null;
  }

  const workspaceCandidate = 'workspace' in payload ? payload.workspace : payload;
  if (!isWorkspaceState(workspaceCandidate)) {
    console.warn(`Ignoring stored layout for user ${userId}: payload was not valid JSON.`);
    return null;
  }

  return {
    version: row.version,
    workspace: workspaceCandidate,
    updatedAt: row.updated_at,
    preferences: 'workspace' in payload ? normalizePreferences(payload.preferences) : createDefaultWorkspacePreferences(),
  };
};

export const createLayoutStore = (): LayoutStore => {
  return {
    async load(userId: string): Promise<LayoutState | null> {
      const database = await getDatabase();
      const rows = await database.select<LayoutRow[]>(
        `SELECT version, workspace_state_json, updated_at
         FROM layouts
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      );

      return hydrateLayoutRow(rows[0], userId);
    },

    async save(userId: string, state: LayoutState): Promise<void> {
      const database = await getDatabase();

      await database.execute(
        `INSERT INTO layouts (user_id, version, workspace_state_json, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT(user_id) DO UPDATE SET
           version = excluded.version,
           workspace_state_json = excluded.workspace_state_json,
           updated_at = excluded.updated_at`,
        [userId, state.version, serializeLayoutState(state), state.updatedAt],
      );
    },
  };
};
