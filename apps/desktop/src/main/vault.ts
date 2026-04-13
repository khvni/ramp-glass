import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ipcMain, type IpcMain } from 'electron';
import type { VaultConfig, Entity } from '@ramp-glass/shared-types';
import { createMemoryStore, indexVault } from '@ramp-glass/memory';

let vaultConfig: VaultConfig | null = null;
let storeInstance: ReturnType<typeof createMemoryStore> | null = null;

const getStore = () => {
    if (!storeInstance) {
       storeInstance = createMemoryStore(path.join(vaultConfig?.path || process.cwd(), '.glass-memory.db'));
    }
    return storeInstance;
};

export const VAULT_IPC_CHANNELS = {
    setupVault: 'vault:setup',
    getRecentEntities: 'vault:getRecentEntities'
};

export const registerVaultIpcHandlers = (ipc: IpcMain = ipcMain): void => {
    ipc.handle(VAULT_IPC_CHANNELS.setupVault, async (_, config: VaultConfig) => {
        vaultConfig = config;

        if (config.isNew) {
            if (!existsSync(config.path)) {
                await fs.mkdir(config.path, { recursive: true });
            }
        }

        const store = getStore();
        await indexVault(config, store);

        return true;
    });

    ipc.handle(VAULT_IPC_CHANNELS.getRecentEntities, async (_, limit: number = 20) => {
        const store = getStore();
        return await store.recentEntities(limit);
    });
};

export const getVaultConfig = () => vaultConfig;
