import { useState } from 'react'
import { Provider } from '@/types'

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'qwen', label: 'Qwen (Alibaba)' },
  { value: 'deepseek', label: 'DeepSeek' },
]

const BASE_URLS: Record<Provider, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  deepseek: 'https://api.deepseek.com',
}

export default function OnboardingFlow({ onComplete }: {
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const [provider, setProvider] = useState<Provider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    setTesting(true)
    setError('')

    try {
      // Test the connection
      const testResult = await window.api.invoke(
        'model-gateway:test',
        provider,
        apiKey.trim(),
        BASE_URLS[provider]
      ) as { success: boolean; error?: string }

      if (!testResult.success) {
        setError(testResult.error || 'Connection test failed')
        setTesting(false)
        return
      }

      // Save the config
      await window.api.invoke('model-config:create', {
        provider,
        apiKey: apiKey.trim(),
        baseUrl: BASE_URLS[provider],
      })

      setSuccess(true)
      setStep(2)
    } catch (err: any) {
      setError(err?.message || 'Failed to save configuration')
    } finally {
      setTesting(false)
    }
  }

  const handleSkip = () => {
    setStep(2)
  }

  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'sans-serif',
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: 48,
    width: 500,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  }

  const btnPrimary: React.CSSProperties = {
    padding: '12px 32px',
    background: '#2B5EA7',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  }

  const btnSecondary: React.CSSProperties = {
    padding: '10px 24px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 12,
  }

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#333', margin: '0 0 12px' }}>
            Welcome to NexusResearch
          </h1>
          <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', lineHeight: 1.5 }}>
            Your desktop academic research assistant.
            <br />
            Let's get you set up in just a moment.
          </p>
          <button
            style={btnPrimary}
            onClick={() => setStep(1)}
            onMouseEnter={e => e.currentTarget.style.background = '#1a4a8a'}
            onMouseLeave={e => e.currentTarget.style.background = '#2B5EA7'}
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  // Step 1: API Key Setup
  if (step === 1) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#333', margin: '0 0 8px' }}>
            Configure AI Provider
          </h2>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px' }}>
            Connect an AI model to power research assistance features.
          </p>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>
              Provider
            </label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value as Provider)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError('') }}
              placeholder="Enter your API key"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${error ? '#e53935' : '#ddd'}`,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <p style={{ color: '#e53935', fontSize: 13, margin: '8px 0 0' }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              style={{
                ...btnPrimary,
                width: '100%',
                opacity: testing ? 0.7 : 1,
              }}
              onClick={handleTestAndSave}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test & Save'}
            </button>
            <button
              style={{ ...btnSecondary, width: '100%' }}
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Done
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>
          {success ? '✅' : '👋'}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#333', margin: '0 0 12px' }}>
          {success ? "You're all set!" : 'Setup Complete'}
        </h2>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', lineHeight: 1.5 }}>
          {success
            ? 'Your AI provider is configured and ready to use.'
            : 'You can configure an AI provider later in Settings.'}
        </p>
        <button
          style={btnPrimary}
          onClick={onComplete}
          onMouseEnter={e => e.currentTarget.style.background = '#1a4a8a'}
          onMouseLeave={e => e.currentTarget.style.background = '#2B5EA7'}
        >
          Start Using NexusResearch
        </button>
      </div>
    </div>
  )
}
