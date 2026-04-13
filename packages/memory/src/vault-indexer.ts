import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { MemoryStore } from '@ramp-glass/shared-types';
import { extractEntities } from './entity-extractor.js';

export async function indexVault(config: { path: string }, store: MemoryStore): Promise<number> {
    let processedFiles = 0;

    async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== '.git' && entry.name !== 'node_modules') {
                    await walk(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                const content = await fs.readFile(fullPath, 'utf8');
                const parsed = matter(content);

                // For testing/mocking, just take any heuristics from the content itself.
                // In a real scenario, we might want to also create an entity for the file itself.
                const newEntities = extractEntities(parsed.content);

                // Add an entity for the document
                const docId = `doc-${entry.name.toLowerCase()}`;
                await store.upsertEntity({
                    id: docId,
                    kind: 'document',
                    name: parsed.data.title || entry.name,
                    aliases: [],
                    sources: [],
                    attributes: parsed.data,
                    lastSeenAt: new Date().toISOString()
                });

                for (const ent of newEntities) {
                    await store.upsertEntity(ent);
                }

                processedFiles++;
            }
        }
    }

    await walk(config.path);
    return processedFiles;
}
