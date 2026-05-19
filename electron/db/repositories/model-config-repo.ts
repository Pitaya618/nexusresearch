import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { Provider } from '../../model-gateway/types'

export interface ModelConfig {
  id: string
  provider: Provider
  apiKey: string
  baseUrl: string | null
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

interface ModelConfigRow {
  id: string
  provider: string
  api_key: string
  base_url: string | null
  is_enabled: number
  created_at: string
  updated_at: string
}

export class ModelConfigRepository {
  constructor(private db: Database.Database) {}

  create(input: { provider: Provider; apiKey: string; baseUrl: string }): ModelConfig {
    const id = uuidv4()
    const stmt = this.db.prepare(`
      INSERT INTO model_config (id, provider, api_key, base_url)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, input.provider, input.apiKey, input.baseUrl)
    return this.findById(id)!
  }

  findById(id: string): ModelConfig | null {
    const stmt = this.db.prepare('SELECT * FROM model_config WHERE id = ?')
    const row = stmt.get(id) as ModelConfigRow | undefined
    return row ? this.toModel(row) : null
  }

  findAll(): ModelConfig[] {
    const stmt = this.db.prepare('SELECT * FROM model_config ORDER BY created_at DESC')
    const rows = stmt.all() as ModelConfigRow[]
    return rows.map(row => this.toModel(row))
  }

  update(id: string, data: Partial<{ apiKey: string; baseUrl: string; isEnabled: boolean; provider: string }>): ModelConfig | null {
    const fields: string[] = []
    const values: unknown[] = []

    if (data.apiKey !== undefined) {
      fields.push('api_key = ?')
      values.push(data.apiKey)
    }
    if (data.baseUrl !== undefined) {
      fields.push('base_url = ?')
      values.push(data.baseUrl)
    }
    if (data.isEnabled !== undefined) {
      fields.push('is_enabled = ?')
      values.push(data.isEnabled ? 1 : 0)
    }
    if (data.provider !== undefined) {
      fields.push('provider = ?')
      values.push(data.provider)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push("updated_at = datetime('now')")
    values.push(id)

    const sql = `UPDATE model_config SET ${fields.join(', ')} WHERE id = ?`
    const stmt = this.db.prepare(sql)
    stmt.run(...values)

    return this.findById(id)
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM model_config WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private toModel(row: ModelConfigRow): ModelConfig {
    return {
      id: row.id,
      provider: row.provider as Provider,
      apiKey: row.api_key,
      baseUrl: row.base_url,
      isEnabled: row.is_enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
