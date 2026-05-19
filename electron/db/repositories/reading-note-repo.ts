import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export class ReadingNoteRepository {
  constructor(private db: Database.Database) {}

  findOrCreate(literatureId: string) {
    let row = this.db.prepare('SELECT * FROM reading_note WHERE literature_id = ?').get(literatureId) as any
    if (!row) {
      const id = uuid()
      const now = new Date().toISOString()
      this.db.prepare('INSERT INTO reading_note (id, literature_id, content, created_at, updated_at) VALUES (?, ?, \'\', ?, ?)')
        .run(id, literatureId, now, now)
      row = this.db.prepare('SELECT * FROM reading_note WHERE id = ?').get(id)
    }
    return {
      id: row.id,
      literatureId: row.literature_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  update(literatureId: string, content: string) {
    const now = new Date().toISOString()
    this.db.prepare('UPDATE reading_note SET content = ?, updated_at = ? WHERE literature_id = ?')
      .run(content, now, literatureId)
    return this.findOrCreate(literatureId)
  }
}
