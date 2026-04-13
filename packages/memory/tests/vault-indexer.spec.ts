import { describe, it, expect } from 'vitest';
import { createMemoryStore } from '../src/store.js';
import { indexVault } from '../src/vault-indexer.js';
import path from 'node:path';

describe('Vault Indexer', () => {
    it('indexes vault and extracts entities', async () => {
        const store = createMemoryStore(':memory:');
        const count = await indexVault({ path: path.join(__dirname, 'fixtures') }, store);

        expect(count).toBeGreaterThan(0);

        const bob = await store.getEntity('person-bob');
        expect(bob).toBeDefined();

        const proj = await store.getEntity('project-secretproject');
        expect(proj).toBeDefined();

        const doc = await store.getEntity('doc-test.md');
        expect(doc).toBeDefined();
        expect(doc?.name).toBe('Test Note');
    });
});
