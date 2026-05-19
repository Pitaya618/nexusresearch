import { useState, useEffect } from 'react'
import type { ModelConfig } from '../../types'

interface Binding {
  configId: string
  model: string
}

const MODULES = [
  { id: 'literature', label: 'Literature (AI Summary)' },
  { id: 'reading', label: 'Reading (AI Q&A)' },
  { id: 'scratchpad', label: 'Scratchpad (AI Chat)' },
  { id: 'writing', label: 'Writing (AI Polish)' }
]

const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'],
  qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner']
}

export default function ModelBinding() {
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [bindings, setBindings] = useState<Record<string, Binding>>({})

  useEffect(() => {
    window.api.invoke('model-config:list').then(data => setConfigs(data as ModelConfig[]))
  }, [])

  const handleChange = (module: string, configId: string, model: string) => {
    setBindings({ ...bindings, [module]: { configId, model } })
  }

  const getModelsForConfig = (configId: string) => {
    const config = configs.find(c => c.id === configId)
    return config ? PROVIDER_MODELS[config.provider] || [] : []
  }

  return (
    <div>
      <h3>Model Binding per Module</h3>
      {MODULES.map(m => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: 8,
            borderBottom: '1px solid #eee'
          }}
        >
          <span style={{ width: 200 }}>{m.label}</span>
          <select
            value={bindings[m.id]?.configId || ''}
            onChange={e => {
              const configId = e.target.value
              const models = getModelsForConfig(configId)
              handleChange(m.id, configId, models[0] || '')
            }}
          >
            <option value="">Select API Key...</option>
            {configs.map(c => (
              <option key={c.id} value={c.id}>
                {c.provider} ({c.apiKey.slice(0, 8)}...)
              </option>
            ))}
          </select>
          {bindings[m.id]?.configId && (
            <select
              value={bindings[m.id]?.model || ''}
              onChange={e => handleChange(m.id, bindings[m.id].configId, e.target.value)}
            >
              {getModelsForConfig(bindings[m.id].configId).map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )
}
