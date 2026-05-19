import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'

export interface CreateLiteratureInput {
  title: string
  authors: string[]
  journal: string
  year: number
  doi: string
  abstract: string
  keywords: string[]
  pdfPath: string
  pdfHash: string
}

export class LiteratureRepository {
  constructor(private db: Database.Database) {}

  create(input: CreateLiteratureInput) {
    const id = uuid()
    const now = new Date().toISOString()
    this.db.prepare(`
      INSERT INTO literature (id, title, authors, journal, year, doi, abstract, keywords,
        pdf_path, pdf_hash, tags, collections, is_important, is_read, ai_summary, ai_keywords,
        citation_formats, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', 0, 0, '', '[]', '{}', ?, ?)
    `).run(id, input.title, JSON.stringify(input.authors), input.journal, input.year,
      input.doi, input.abstract, JSON.stringify(input.keywords),
      input.pdfPath, input.pdfHash, now, now)
    return this.findById(id)!
  }

  findById(id: string) {
    const row = this.db.prepare('SELECT * FROM literature WHERE id = ?').get(id) as any
    return row ? this.toModel(row) : null
  }

  findAll() {
    const rows = this.db.prepare('SELECT * FROM literature ORDER BY created_at DESC').all() as any[]
    return rows.map(r => this.toModel(r))
  }

  search(query: string) {
    const like = `%${query}%`
    const rows = this.db.prepare(
      `SELECT * FROM literature WHERE title LIKE ? OR abstract LIKE ? ORDER BY created_at DESC`
    ).all(like, like) as any[]
    return rows.map(r => this.toModel(r))
  }

  findByHash(pdfHash: string) {
    const row = this.db.prepare('SELECT * FROM literature WHERE pdf_hash = ?').get(pdfHash) as any
    return row ? this.toModel(row) : null
  }

  update(id: string, data: Partial<CreateLiteratureInput & { aiSummary: string; aiKeywords: string[]; isRead: boolean; isImportant: boolean; tags: string[]; citationFormats: Record<string, string> }>) {
    const now = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []

    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title) }
    if (data.authors !== undefined) { sets.push('authors = ?'); vals.push(JSON.stringify(data.authors)) }
    if (data.journal !== undefined) { sets.push('journal = ?'); vals.push(data.journal) }
    if (data.year !== undefined) { sets.push('year = ?'); vals.push(data.year) }
    if (data.doi !== undefined) { sets.push('doi = ?'); vals.push(data.doi) }
    if (data.abstract !== undefined) { sets.push('abstract = ?'); vals.push(data.abstract) }
    if (data.keywords !== undefined) { sets.push('keywords = ?'); vals.push(JSON.stringify(data.keywords)) }
    if (data.aiSummary !== undefined) { sets.push('ai_summary = ?'); vals.push(data.aiSummary) }
    if (data.aiKeywords !== undefined) { sets.push('ai_keywords = ?'); vals.push(JSON.stringify(data.aiKeywords)) }
    if (data.isRead !== undefined) { sets.push('is_read = ?'); vals.push(data.isRead ? 1 : 0) }
    if (data.isImportant !== undefined) { sets.push('is_important = ?'); vals.push(data.isImportant ? 1 : 0) }
    if (data.tags !== undefined) { sets.push('tags = ?'); vals.push(JSON.stringify(data.tags)) }
    if (data.citationFormats !== undefined) { sets.push('citation_formats = ?'); vals.push(JSON.stringify(data.citationFormats)) }
    sets.push('updated_at = ?'); vals.push(now)
    vals.push(id)

    this.db.prepare(`UPDATE literature SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM literature WHERE id = ?').run(id)
  }

  private toModel(row: any) {
    return {
      id: row.id,
      title: row.title,
      authors: JSON.parse(row.authors || '[]'),
      journal: row.journal,
      year: row.year,
      doi: row.doi,
      abstract: row.abstract,
      keywords: JSON.parse(row.keywords || '[]'),
      pdfPath: row.pdf_path,
      pdfHash: row.pdf_hash,
      tags: JSON.parse(row.tags || '[]'),
      collections: JSON.parse(row.collections || '[]'),
      isImportant: row.is_important === 1,
      isRead: row.is_read === 1,
      aiSummary: row.ai_summary,
      aiKeywords: JSON.parse(row.ai_keywords || '[]'),
      citationFormats: JSON.parse(row.citation_formats || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
