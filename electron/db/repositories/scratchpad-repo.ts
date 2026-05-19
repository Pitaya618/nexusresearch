import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export class ScratchpadRepository {
  constructor(private db: Database.Database) {}

  create(title: string = 'Untitled') {
    const id = uuid()
    const now = new Date().toISOString()
    this.db.prepare(
      "INSERT INTO scratchpad (id, title, content, chat_history, sort_order, created_at, updated_at) VALUES (?, ?, '', '', 0, ?, ?)"
    ).run(id, title, now, now)
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM scratchpad WHERE id = ?').get(id) as any
    return row ? this.toModel(row) : null
  }

  findAll() {
    const rows = this.db.prepare('SELECT * FROM scratchpad ORDER BY sort_order, updated_at DESC').all() as any[]
    return rows.map(r => this.toModel(r))
  }

  update(id: string, data: { title?: string; content?: string; chatHistory?: any[] }) {
    const now = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []

    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title) }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content) }
    if (data.chatHistory !== undefined) { sets.push('chat_history = ?'); vals.push(JSON.stringify(data.chatHistory)) }
    sets.push('updated_at = ?'); vals.push(now)
    vals.push(id)

    this.db.prepare(`UPDATE scratchpad SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM scratchpad WHERE id = ?').run(id)
  }

  private toModel(row: any) {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      chatHistory: JSON.parse(row.chat_history || '[]'),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
