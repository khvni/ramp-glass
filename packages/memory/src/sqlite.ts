import Database from 'better-sqlite3';

export const createMemorySchema = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT UNIQUE NOT NULL,
      kind TEXT,
      name TEXT,
      aliases TEXT,
      sources TEXT,
      attributes TEXT,
      lastSeenAt TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS relationships (
      subjectId TEXT,
      predicate TEXT,
      objectId TEXT,
      confidence REAL,
      source TEXT,
      PRIMARY KEY (subjectId, predicate, objectId)
    );
  `);

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
      name,
      aliases,
      attributes,
      content='entities',
      content_rowid='rowid'
    );
  `);

  // Setup FTS triggers
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS entities_ai AFTER INSERT ON entities BEGIN
      INSERT INTO entities_fts(rowid, name, aliases, attributes)
      VALUES (new.rowid, new.name, new.aliases, new.attributes);
    END;
    CREATE TRIGGER IF NOT EXISTS entities_ad AFTER DELETE ON entities BEGIN
      INSERT INTO entities_fts(entities_fts, rowid, name, aliases, attributes)
      VALUES ('delete', old.rowid, old.name, old.aliases, old.attributes);
    END;
    CREATE TRIGGER IF NOT EXISTS entities_au AFTER UPDATE ON entities BEGIN
      INSERT INTO entities_fts(entities_fts, rowid, name, aliases, attributes)
      VALUES ('delete', old.rowid, old.name, old.aliases, old.attributes);
      INSERT INTO entities_fts(rowid, name, aliases, attributes)
      VALUES (new.rowid, new.name, new.aliases, new.attributes);
    END;
  `);
};
