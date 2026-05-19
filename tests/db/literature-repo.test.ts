import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { LiteratureRepository } from '../../electron/db/repositories/literature-repo'
import { runMigrationsOnDb } from '../../electron/db/migrations'

describe('LiteratureRepository', () => {
  let db: Database.Database
  let repo: LiteratureRepository

  beforeEach(() => {
    db = new Database(':memory:')
    runMigrationsOnDb(db)
    repo = new LiteratureRepository(db)
  })

  it('creates a literature entry', () => {
    const lit = repo.create({
      title: 'Test Paper',
      authors: ['Alice', 'Bob'],
      journal: 'Nature',
      year: 2024,
      doi: '10.1234/test',
      abstract: 'An abstract',
      keywords: ['AI', 'ML'],
      pdfPath: '/tmp/test.pdf',
      pdfHash: 'abc123'
    })
    expect(lit.id).toBeTruthy()
    expect(lit.title).toBe('Test Paper')
    expect(lit.authors).toEqual(['Alice', 'Bob'])
  })

  it('finds by id', () => {
    const lit = repo.create({
      title: 'Find Me',
      authors: [],
      journal: '',
      year: 2024,
      doi: '',
      abstract: '',
      keywords: [],
      pdfPath: '/tmp/test.pdf',
      pdfHash: 'hash1'
    })
    const found = repo.findById(lit.id)
    expect(found!.title).toBe('Find Me')
  })

  it('searches by title', () => {
    repo.create({ title: 'Deep Learning Survey', authors: [], journal: '', year: 2024, doi: '', abstract: '', keywords: [], pdfPath: '/a.pdf', pdfHash: 'h1' })
    repo.create({ title: 'NLP Methods', authors: [], journal: '', year: 2023, doi: '', abstract: '', keywords: [], pdfPath: '/b.pdf', pdfHash: 'h2' })
    const results = repo.search('Deep')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Deep Learning Survey')
  })

  it('updates a literature entry', () => {
    const lit = repo.create({ title: 'Old', authors: [], journal: '', year: 2024, doi: '', abstract: '', keywords: [], pdfPath: '/a.pdf', pdfHash: 'h1' })
    repo.update(lit.id, { title: 'New' })
    expect(repo.findById(lit.id)!.title).toBe('New')
  })

  it('deletes a literature entry', () => {
    const lit = repo.create({ title: 'Delete Me', authors: [], journal: '', year: 2024, doi: '', abstract: '', keywords: [], pdfPath: '/a.pdf', pdfHash: 'h1' })
    repo.delete(lit.id)
    expect(repo.findById(lit.id)).toBeNull()
  })
})
