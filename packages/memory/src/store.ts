import Database from 'better-sqlite3';
import type { Entity, MemoryStore, MemorySearchResult, Relationship, EntityKind } from '@ramp-glass/shared-types';
import { createMemorySchema } from './sqlite.js';

export function createMemoryStore(dbPath: string): MemoryStore {
  const db = new Database(dbPath);
  createMemorySchema(db);

  return {
    async upsertEntity(entity: Entity): Promise<void> {
      const stmt = db.prepare(`
        INSERT INTO entities (id, kind, name, aliases, sources, attributes, lastSeenAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          kind=excluded.kind,
          name=excluded.name,
          aliases=excluded.aliases,
          sources=excluded.sources,
          attributes=excluded.attributes,
          lastSeenAt=excluded.lastSeenAt
      `);

      stmt.run(
        entity.id,
        entity.kind,
        entity.name,
        JSON.stringify(entity.aliases),
        JSON.stringify(entity.sources),
        JSON.stringify(entity.attributes),
        entity.lastSeenAt
      );
    },

    async upsertRelationship(rel: Relationship): Promise<void> {
      const stmt = db.prepare(`
        INSERT INTO relationships (subjectId, predicate, objectId, confidence, source)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(subjectId, predicate, objectId) DO UPDATE SET
          confidence=excluded.confidence,
          source=excluded.source
      `);

      stmt.run(
        rel.subjectId,
        rel.predicate,
        rel.objectId,
        rel.confidence,
        rel.source
      );
    },

    async getEntity(id: string): Promise<Entity | null> {
      const stmt = db.prepare(`SELECT * FROM entities WHERE id = ?`);
      const row = stmt.get(id) as any;
      if (!row) return null;

      return {
        id: row.id,
        kind: row.kind as EntityKind,
        name: row.name,
        aliases: JSON.parse(row.aliases),
        sources: JSON.parse(row.sources),
        attributes: JSON.parse(row.attributes),
        lastSeenAt: row.lastSeenAt
      };
    },

    async search(query: string, limit: number = 10): Promise<MemorySearchResult[]> {
      // Use FTS5 for text search
      const stmt = db.prepare(`
        SELECT entities.*, entities_fts.rank
        FROM entities_fts
        JOIN entities ON entities.rowid = entities_fts.rowid
        WHERE entities_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `);

      // SQLite FTS5 query needs basic escaping, fallback to OR query
      const terms = query.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).filter(t => t.length > 0);
      if (terms.length === 0) return [];

      const ftsQuery = terms.map(t => `${t}*`).join(' OR ');

      const rows = stmt.all(ftsQuery, limit) as any[];

      return rows.map(row => ({
        entity: {
          id: row.id,
          kind: row.kind as EntityKind,
          name: row.name,
          aliases: JSON.parse(row.aliases),
          sources: JSON.parse(row.sources),
          attributes: JSON.parse(row.attributes),
          lastSeenAt: row.lastSeenAt
        },
        // Invert rank as sqlite fts rank is negative (more negative = better)
        score: Math.abs(row.rank)
      }));
    },

    async recentEntities(limit: number): Promise<Entity[]> {
      const stmt = db.prepare(`
        SELECT * FROM entities
        ORDER BY lastSeenAt DESC
        LIMIT ?
      `);

      const rows = stmt.all(limit) as any[];

      return rows.map(row => ({
        id: row.id,
        kind: row.kind as EntityKind,
        name: row.name,
        aliases: JSON.parse(row.aliases),
        sources: JSON.parse(row.sources),
        attributes: JSON.parse(row.attributes),
        lastSeenAt: row.lastSeenAt
      }));
    }
  };
}
