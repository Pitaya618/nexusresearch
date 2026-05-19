import Database from 'better-sqlite3'

export function runMigrationsOnDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS model_config (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      base_url TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS module_model_binding (
      module TEXT PRIMARY KEY,
      model_config_id TEXT NOT NULL,
      model_name TEXT NOT NULL,
      FOREIGN KEY (model_config_id) REFERENCES model_config(id)
    );

    CREATE TABLE IF NOT EXISTS literature (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT,
      journal TEXT,
      year INTEGER,
      doi TEXT,
      abstract TEXT,
      keywords TEXT,
      pdf_path TEXT,
      pdf_hash TEXT,
      tags TEXT,
      collections TEXT,
      is_important INTEGER NOT NULL DEFAULT 0,
      is_read INTEGER NOT NULL DEFAULT 0,
      ai_summary TEXT,
      ai_keywords TEXT,
      citation_formats TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tag (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS collection (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_system INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reading_note (
      id TEXT PRIMARY KEY,
      literature_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (literature_id) REFERENCES literature(id)
    );

    CREATE TABLE IF NOT EXISTS annotation (
      id TEXT PRIMARY KEY,
      literature_id TEXT NOT NULL,
      page INTEGER NOT NULL,
      type TEXT NOT NULL,
      rect_x REAL,
      rect_y REAL,
      rect_w REAL,
      rect_h REAL,
      color TEXT,
      color_label TEXT,
      text TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (literature_id) REFERENCES literature(id)
    );

    CREATE TABLE IF NOT EXISTS scratchpad (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      chat_history TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS paper (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_journal TEXT,
      project_path TEXT,
      main_file TEXT,
      template TEXT,
      citations TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

export function runMigrations(): void {
  const { getDb } = require('./connection')
  const db = getDb()
  runMigrationsOnDb(db)
}
