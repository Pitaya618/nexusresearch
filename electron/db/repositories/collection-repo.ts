import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export class CollectionRepository {
  constructor(private db: Database.Database) {}

  initDefaults() {
    const existing = this.db.prepare('SELECT COUNT(*) as c FROM collection WHERE is_system = 1').get() as any
    if (existing.c > 0) return
    const now = new Date().toISOString()
    const defaults = [
      { name: 'All', sort: 0 },
      { name: 'Important', sort: 1 },
      { name: 'Read', sort: 2 },
      { name: 'Unread', sort: 3 }
    ]
    for (const d of defaults) {
      this.db.prepare('INSERT INTO collection (id, name, is_system, sort_order, created_at) VALUES (?, ?, 1, ?, ?)')
        .run(uuid(), d.name, d.sort, now)
    }
  }

  create(name: string) {
    const id = uuid()
    this.db.prepare('INSERT INTO collection (id, name, is_system, sort_order, created_at) VALUES (?, ?, 0, 0, ?)')
      .run(id, name, new Date().toISOString())
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM collection WHERE id = ?').get(id) as any
    return row ? { id: row.id, name: row.name, isSystem: row.is_system === 1, sortOrder: row.sort_order, createdAt: row.created_at } : null
  }

  findAll() {
    const rows = this.db.prepare('SELECT * FROM collection ORDER BY sort_order').all() as any[]
    return rows.map(r => ({ id: r.id, name: r.name, isSystem: r.is_system === 1, sortOrder: r.sort_order, createdAt: r.created_at }))
  }

  update(id: string, data: { name?: string; sortOrder?: number }) {
    const sets: string[] = []
    const vals: unknown[] = []
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name) }
    if (data.sortOrder !== undefined) { sets.push('sort_order = ?'); vals.push(data.sortOrder) }
    if (sets.length === 0) return
    vals.push(id)
    this.db.prepare(`UPDATE collection SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM collection WHERE id = ? AND is_system = 0').run(id)
  }
}
