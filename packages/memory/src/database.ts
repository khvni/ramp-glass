import Database from '@tauri-apps/plugin-sql';

const DEFAULT_SQL_URL = 'sqlite:tinker.db';

let databasePromise: Promise<Database> | null = null;

const schema = [
  `CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    aliases_json TEXT NOT NULL,
    sources_json TEXT NOT NULL,
    attributes_json TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS relationships (
    subject_id TEXT NOT NULL,
    predicate TEXT NOT NULL,
    object_id TEXT NOT NULL,
    confidence REAL NOT NULL,
    source TEXT NOT NULL,
    PRIMARY KEY (subject_id, predicate, object_id)
  )`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
    id UNINDEXED,
    name,
    aliases
  )`,
  `CREATE TABLE IF NOT EXISTS layouts (
    user_id TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    dockview_model_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    schedule TEXT NOT NULL,
    timezone TEXT NOT NULL,
    output_sinks_json TEXT NOT NULL,
    enabled INTEGER NOT NULL,
    last_run_at TEXT,
    last_run_status TEXT,
    next_run_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS job_runs (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    scheduled_for TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT NOT NULL,
    status TEXT NOT NULL,
    output_text TEXT,
    error_text TEXT,
    delivered_sinks_json TEXT NOT NULL,
    skipped_count INTEGER NOT NULL DEFAULT 0
  )`,
];

const bootstrap = async (database: Database): Promise<Database> => {
  for (const statement of schema) {
    await database.execute(statement);
  }

  return database;
};

export const getDatabase = async (sqlUrl = DEFAULT_SQL_URL): Promise<Database> => {
  if (!databasePromise) {
    databasePromise = Database.load(sqlUrl).then(bootstrap);
  }

  return databasePromise;
};

export const resetDatabaseCache = (): void => {
  databasePromise = null;
};
