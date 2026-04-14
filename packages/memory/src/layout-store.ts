import type { LayoutState, LayoutStore } from '@tinker/shared-types';
import { getDatabase } from './database.js';

type LayoutRow = {
  version: number;
  dockview_model_json: string;
  updated_at: string;
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

      const row = rows[0];
      if (!row) {
        return null;
      }

      return {
        version: row.version as 1,
        dockviewModel: JSON.parse(row.dockview_model_json) as unknown,
        updatedAt: row.updated_at,
      };
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
        [userId, state.version, JSON.stringify(state.dockviewModel), state.updatedAt],
      );
    },
  };
};
