import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export class TagRepository {
  constructor(private db: Database.Database) {}

  create(name: string, color: string = '#4A90D9') {
    const id = uuid()
    this.db.prepare('INSERT INTO tag (id, name, color, created_at) VALUES (?, ?, ?, ?)')
      .run(id, name, color, new Date().toISOString())
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM tag WHERE id = ?').get(id) as any
    return row ? { id: row.id, name: row.name, color: row.color, createdAt: row.created_at } : null
  }

  findAll() {
    const rows = this.db.prepare('SELECT * FROM tag ORDER BY name').all() as any[]
    return rows.map(r => ({ id: r.id, name: r.name, color: r.color, createdAt: r.created_at }))
  }

  update(id: string, data: { name?: string; color?: string }) {
    const sets: string[] = []
    const vals: unknown[] = []
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name) }
    if (data.color !== undefined) { sets.push('color = ?'); vals.push(data.color) }
    if (sets.length === 0) return
    vals.push(id)
    this.db.prepare(`UPDATE tag SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM tag WHERE id = ?').run(id)
  }
}
