import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export interface PaperCitation {
  literatureId: string
  citeKey: string
}

export class PaperRepository {
  constructor(private db: Database.Database) {}

  create(input: { title: string; targetJournal: string; projectPath: string; template?: string }) {
    const id = uuid()
    const now = new Date().toISOString()
    this.db.prepare(`
      INSERT INTO paper (id, title, target_journal, project_path, main_file, template, citations, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'main.tex', ?, '[]', ?, ?)
    `).run(id, input.title, input.targetJournal, input.projectPath, input.template || 'general', now, now)
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM paper WHERE id = ?').get(id) as any
    return row ? this.toModel(row) : null
  }

  findAll() {
    const rows = this.db.prepare('SELECT * FROM paper ORDER BY updated_at DESC').all() as any[]
    return rows.map(r => this.toModel(r))
  }

  update(id: string, data: { title?: string; template?: string; citations?: PaperCitation[] }) {
    const now = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []

    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title) }
    if (data.template !== undefined) { sets.push('template = ?'); vals.push(data.template) }
    if (data.citations !== undefined) { sets.push('citations = ?'); vals.push(JSON.stringify(data.citations)) }
    sets.push('updated_at = ?'); vals.push(now)
    vals.push(id)

    this.db.prepare(`UPDATE paper SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM paper WHERE id = ?').run(id)
  }

  private toModel(row: any) {
    return {
      id: row.id,
      title: row.title,
      targetJournal: row.target_journal,
      projectPath: row.project_path,
      mainFile: row.main_file,
      template: row.template,
      citations: JSON.parse(row.citations || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
