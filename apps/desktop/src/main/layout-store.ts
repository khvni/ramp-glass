import Database from 'better-sqlite3';
import path from 'node:path';
import { app, ipcMain, type IpcMain } from 'electron';
import type { LayoutState, LayoutStore } from '@ramp-glass/shared-types';

export const LAYOUT_IPC_CHANNELS = {
    loadLayout: 'layout:load',
    saveLayout: 'layout:save'
};

class SQLiteLayoutStore implements LayoutStore {
    private db: Database.Database;

    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'layout.db');
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS layouts (
                userId TEXT PRIMARY KEY,
                version INTEGER,
                dockviewModel TEXT,
                updatedAt TEXT
            );
        `);
    }

    async load(userId: string): Promise<LayoutState | null> {
        const stmt = this.db.prepare('SELECT * FROM layouts WHERE userId = ?');
        const row = stmt.get(userId) as any;

        if (!row) return null;

        return {
            version: row.version,
            dockviewModel: JSON.parse(row.dockviewModel),
            updatedAt: row.updatedAt
        };
    }

    async save(userId: string, state: LayoutState): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO layouts (userId, version, dockviewModel, updatedAt)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(userId) DO UPDATE SET
                version=excluded.version,
                dockviewModel=excluded.dockviewModel,
                updatedAt=excluded.updatedAt
        `);
        stmt.run(userId, state.version, JSON.stringify(state.dockviewModel), state.updatedAt);
    }
}

let storeInstance: LayoutStore | null = null;

export const registerLayoutIpcHandlers = (ipc: IpcMain = ipcMain): void => {
    if (!storeInstance) {
        storeInstance = new SQLiteLayoutStore();
    }

    ipc.handle(LAYOUT_IPC_CHANNELS.loadLayout, async (_, userId: string = 'default') => {
        return await storeInstance!.load(userId);
    });

    ipc.handle(LAYOUT_IPC_CHANNELS.saveLayout, async (_, { userId = 'default', state }: { userId?: string, state: LayoutState }) => {
        await storeInstance!.save(userId, state);
        return true;
    });
};
