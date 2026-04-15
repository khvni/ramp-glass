import {
  createDefaultWorkspacePreferences,
  type LayoutState,
  type LayoutStore,
  type WorkspacePreferences,
} from '@tinker/shared-types';
import { getDatabase } from './database.js';

export type LayoutRow = {
  version: number;
  dockview_model_json: string;
  updated_at: string;
};

export const CURRENT_LAYOUT_VERSION = 1 as const;

type StoredLayoutPayload = {
  dockviewModel: unknown;
  preferences?: unknown;
};

const parseDockviewModel = (raw: string): unknown | null => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
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
    dockviewModel: state.dockviewModel,
    preferences: state.preferences,
  };

  return JSON.stringify(payload);
};

const isVersionCompatible = (version: number): version is 1 => {
  return version === CURRENT_LAYOUT_VERSION;
};

export const hydrateLayoutRow = (row: LayoutRow | undefined, userId: string): LayoutState | null => {
  if (!row) {
    return null;
  }

  if (!isVersionCompatible(row.version)) {
    console.warn(
      `Ignoring stored layout for user ${userId}: version ${row.version} is not compatible with app version ${CURRENT_LAYOUT_VERSION}.`,
    );
    return null;
  }

  const model = parseDockviewModel(row.dockview_model_json);
  if (model === null || typeof model !== 'object') {
    console.warn(`Ignoring stored layout for user ${userId}: payload was not valid JSON.`);
    return null;
  }

  const candidate = model as Record<string, unknown>;
  const dockviewModel = 'dockviewModel' in candidate ? candidate.dockviewModel : model;
  const preferences = 'dockviewModel' in candidate ? normalizePreferences(candidate.preferences) : createDefaultWorkspacePreferences();

  if (!dockviewModel || typeof dockviewModel !== 'object') {
    console.warn(`Ignoring stored layout for user ${userId}: payload was not valid JSON.`);
    return null;
  }

  return {
    version: row.version,
    dockviewModel,
    updatedAt: row.updated_at,
    preferences,
  };
};

export const createLayoutStore = (): LayoutStore => {
  return {
    async load(userId: string): Promise<LayoutState | null> {
      const database = await getDatabase();
      const rows = await database.select<LayoutRow[]>(
        `SELECT version, dockview_model_json, updated_at
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
        `INSERT INTO layouts (user_id, version, dockview_model_json, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT(user_id) DO UPDATE SET
           version = excluded.version,
           dockview_model_json = excluded.dockview_model_json,
           updated_at = excluded.updated_at`,
        [userId, state.version, serializeLayoutState(state), state.updatedAt],
      );
    },
  };
};
