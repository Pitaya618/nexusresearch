import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dataDir = path.join(app.getPath('home'), '.nexusresearch', 'db')
  fs.mkdirSync(dataDir, { recursive: true })

  const dbPath = path.join(dataDir, 'nexus.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
