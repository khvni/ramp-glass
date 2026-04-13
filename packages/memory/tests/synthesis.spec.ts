import { describe, it, expect } from 'vitest';
import { createMemoryStore } from '../src/store.js';
import { runDailySynthesis } from '../src/synthesis.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('Synthesis', () => {
   it('writes a daily summary note', async () => {
       const store = createMemoryStore(':memory:');
       const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'glass-vault-'));

       await store.upsertEntity({
           id: 'e1',
           kind: 'project',
           name: 'Apollo',
           aliases: [],
           sources: [],
           attributes: {},
           lastSeenAt: new Date().toISOString()
       });

       await runDailySynthesis(tmpDir, store);

       const dateStr = new Date().toISOString().split('T')[0];
       const fileContent = await fs.readFile(path.join(tmpDir, `daily-summary-${dateStr}.md`), 'utf8');

       expect(fileContent).toContain('Apollo');
   });
});
