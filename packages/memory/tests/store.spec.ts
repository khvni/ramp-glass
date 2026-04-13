import { describe, it, expect } from 'vitest';
import { createMemoryStore } from '../src/store.js';

describe('Memory store', () => {
   it('upserts and searches entities via fts', async () => {
       const store = createMemoryStore(':memory:');

       await store.upsertEntity({
           id: 'e1',
           kind: 'person',
           name: 'Alice',
           aliases: ['Al'],
           sources: [],
           attributes: {},
           lastSeenAt: '2023-01-01T00:00:00Z'
       });

       const ent = await store.getEntity('e1');
       expect(ent).toBeDefined();
       expect(ent?.name).toBe('Alice');

       const results = await store.search('Alice');
       expect(results.length).toBe(1);
       expect(results[0].entity.name).toBe('Alice');

       const recents = await store.recentEntities(10);
       expect(recents.length).toBe(1);
   });
});
