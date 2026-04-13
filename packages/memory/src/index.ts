import type { MemoryStore } from '@ramp-glass/shared-types';
import type { VaultConfig } from '@ramp-glass/shared-types/vault';

export const createMemoryStore = (_config: { dbPath: string }): MemoryStore => {
  throw new Error('memory: not yet implemented — see tasks/memory.md');
};

export const indexVault = async (_vault: VaultConfig): Promise<{ entitiesIndexed: number }> => {
  throw new Error('indexVault: not yet implemented — see tasks/memory.md');
};

export const runDailySynthesis = async (_userId: string): Promise<{ summary: string }> => {
  throw new Error('runDailySynthesis: not yet implemented — see tasks/memory.md');
};
