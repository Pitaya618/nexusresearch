import { useState, useEffect } from 'react'
import type { ModelConfig, Provider } from '../../types'

const PROVIDERS: { value: Provider; label: string; models: string[] }[] = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'] },
  { value: 'qwen', label: 'Qwen (Alibaba)', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] }
]

export default function ApiKeyManager() {
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<{ provider: Provider; apiKey: string; baseUrl: string }>({
    provider: 'openai',
    apiKey: '',
    baseUrl: ''
  })
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    window.api.invoke('model-config:list').then(data => setConfigs(data as ModelConfig[]))
  }, [])

  const handleTest = async () => {
    setTesting(true)
    const ok = await window.api.invoke(
      'model-gateway:test',
      form.provider,
      form.apiKey,
      form.baseUrl || undefined
    ) as boolean
    setTesting(false)
    alert(ok ? 'Connection successful!' : 'Connection failed. Check your API key.')
  }

  const handleSave = async () => {
    await window.api.invoke('model-config:create', form)
    const updated = await window.api.invoke('model-config:list') as ModelConfig[]
    setConfigs(updated)
    setShowAdd(false)
    setForm({ provider: 'openai', apiKey: '', baseUrl: '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this API key?')) return
    await window.api.invoke('model-config:delete', id)
    setConfigs(configs.filter(c => c.id !== id))
  }

  return (
    <div>
      <h3>API Keys</h3>
      <button onClick={() => setShowAdd(true)}>+ Add API Key</button>

      {configs.map(c => (
        <div
          key={c.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            border: '1px solid #ddd',
            borderRadius: 4,
            marginTop: 8
          }}
        >
          <span style={{ fontWeight: 600 }}>{c.provider}</span>
          <code>{c.apiKey.slice(0, 8)}...{c.apiKey.slice(-4)}</code>
          <span style={{ color: c.isEnabled ? 'green' : 'gray' }}>
            {c.isEnabled ? 'Active' : 'Disabled'}
          </span>
          <button onClick={() => handleDelete(c.id)}>Delete</button>
        </div>
      ))}

      {showAdd && (
        <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h4>Add API Key</h4>
          <div style={{ marginBottom: 8 }}>
            <label>Provider: </label>
            <select
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value as Provider })}
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>API Key: </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={e => setForm({ ...form, apiKey: e.target.value })}
              style={{ width: 400 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Base URL (optional): </label>
            <input
              value={form.baseUrl}
              onChange={e => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="Leave empty for default"
              style={{ width: 400 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleTest} disabled={testing || !form.apiKey}>
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={handleSave} disabled={!form.apiKey}>Save</button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
