import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export class AnnotationRepository {
  constructor(private db: Database.Database) {}

  create(input: {
    literatureId: string
    page: number
    type: 'highlight' | 'text_note'
    rect: { x: number; y: number; w: number; h: number }
    color: string
    colorLabel: string
    text: string
    note?: string
  }) {
    const id = uuid()
    this.db.prepare(`
      INSERT INTO annotation (id, literature_id, page, type, rect_x, rect_y, rect_w, rect_h,
        color, color_label, text, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, input.literatureId, input.page, input.type,
      input.rect.x, input.rect.y, input.rect.w, input.rect.h,
      input.color, input.colorLabel, input.text, input.note || '', new Date().toISOString())
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM annotation WHERE id = ?').get(id) as any
    return row ? this.toModel(row) : null
  }

  findByLiterature(literatureId: string) {
    const rows = this.db.prepare(
      'SELECT * FROM annotation WHERE literature_id = ? ORDER BY page, created_at'
    ).all(literatureId) as any[]
    return rows.map(r => this.toModel(r))
  }

  findByPage(literatureId: string, page: number) {
    const rows = this.db.prepare(
      'SELECT * FROM annotation WHERE literature_id = ? AND page = ? ORDER BY created_at'
    ).all(literatureId, page) as any[]
    return rows.map(r => this.toModel(r))
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM annotation WHERE id = ?').run(id)
  }

  deleteByLiterature(literatureId: string) {
    this.db.prepare('DELETE FROM annotation WHERE literature_id = ?').run(literatureId)
  }

  private toModel(row: any) {
    return {
      id: row.id,
      literatureId: row.literature_id,
      page: row.page,
      type: row.type,
      rect: { x: row.rect_x, y: row.rect_y, w: row.rect_w, h: row.rect_h },
      color: row.color,
      colorLabel: row.color_label,
      text: row.text,
      note: row.note,
      createdAt: row.created_at
    }
  }
}
