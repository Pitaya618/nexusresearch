import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrationsOnDb } from '../../electron/db/migrations'
import { ModelConfigRepository } from '../../electron/db/repositories/model-config-repo'

describe('ModelConfigRepository', () => {
  let db: Database.Database
  let repo: ModelConfigRepository

  beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    runMigrationsOnDb(db)
    repo = new ModelConfigRepository(db)
  })

  afterEach(() => {
    db.close()
  })

  it('should create and retrieve a config', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-test-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    expect(created.id).toBeDefined()
    expect(created.provider).toBe('openai')
    expect(created.apiKey).toBe('sk-test-key')
    expect(created.baseUrl).toBe('https://api.openai.com/v1')
    expect(created.isEnabled).toBe(true)
    expect(created.createdAt).toBeDefined()
    expect(created.updatedAt).toBeDefined()

    const found = repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.provider).toBe('openai')
    expect(found!.apiKey).toBe('sk-test-key')
  })

  it('should return null for non-existent id', () => {
    const found = repo.findById('non-existent-id')
    expect(found).toBeNull()
  })

  it('should list all configs', () => {
    repo.create({ provider: 'openai', apiKey: 'key1', baseUrl: 'https://api.openai.com/v1' })
    repo.create({ provider: 'anthropic', apiKey: 'key2', baseUrl: 'https://api.anthropic.com' })
    repo.create({ provider: 'deepseek', apiKey: 'key3', baseUrl: 'https://api.deepseek.com' })

    const all = repo.findAll()
    expect(all).toHaveLength(3)
    expect(all.map(c => c.provider)).toContain('openai')
    expect(all.map(c => c.provider)).toContain('anthropic')
    expect(all.map(c => c.provider)).toContain('deepseek')
  })

  it('should return empty array when no configs exist', () => {
    const all = repo.findAll()
    expect(all).toHaveLength(0)
  })

  it('should update apiKey', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'old-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    const updated = repo.update(created.id, { apiKey: 'new-key' })
    expect(updated).not.toBeNull()
    expect(updated!.apiKey).toBe('new-key')
    expect(updated!.baseUrl).toBe('https://api.openai.com/v1')
  })

  it('should update baseUrl', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: 'https://old-url.com',
    })

    const updated = repo.update(created.id, { baseUrl: 'https://new-url.com' })
    expect(updated).not.toBeNull()
    expect(updated!.baseUrl).toBe('https://new-url.com')
  })

  it('should update isEnabled', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    expect(created.isEnabled).toBe(true)

    const updated = repo.update(created.id, { isEnabled: false })
    expect(updated).not.toBeNull()
    expect(updated!.isEnabled).toBe(false)
  })

  it('should update provider', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    const updated = repo.update(created.id, { provider: 'anthropic' })
    expect(updated).not.toBeNull()
    expect(updated!.provider).toBe('anthropic')
  })

  it('should update multiple fields at once', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'old-key',
      baseUrl: 'https://old-url.com',
    })

    const updated = repo.update(created.id, {
      apiKey: 'new-key',
      baseUrl: 'https://new-url.com',
      isEnabled: false,
    })

    expect(updated).not.toBeNull()
    expect(updated!.apiKey).toBe('new-key')
    expect(updated!.baseUrl).toBe('https://new-url.com')
    expect(updated!.isEnabled).toBe(false)
  })

  it('should return current config when no fields to update', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    const updated = repo.update(created.id, {})
    expect(updated).not.toBeNull()
    expect(updated!.id).toBe(created.id)
  })

  it('should return null when updating non-existent id', () => {
    const updated = repo.update('non-existent-id', { apiKey: 'new-key' })
    expect(updated).toBeNull()
  })

  it('should delete a config', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: 'https://api.openai.com/v1',
    })

    const deleted = repo.delete(created.id)
    expect(deleted).toBe(true)

    const found = repo.findById(created.id)
    expect(found).toBeNull()
  })

  it('should return false when deleting non-existent id', () => {
    const deleted = repo.delete('non-existent-id')
    expect(deleted).toBe(false)
  })

  it('should handle null baseUrl', () => {
    const created = repo.create({
      provider: 'openai',
      apiKey: 'sk-key',
      baseUrl: '',
    })

    expect(created.baseUrl).toBe('')

    const found = repo.findById(created.id)
    expect(found!.baseUrl).toBe('')
  })
})
