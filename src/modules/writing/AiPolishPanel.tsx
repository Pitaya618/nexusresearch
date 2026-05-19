import { useState } from 'react'

const MODES = [
  { id: 'academic', label: 'Academic' },
  { id: 'concise', label: 'Concise' },
  { id: 'expand', label: 'Expand' },
  { id: 'preserve', label: 'Preserve Meaning' }
]

export default function AiPolishPanel({ paperId, selectedText, onApply }: {
  paperId: string
  selectedText: string
  onApply: (polished: string) => void
}) {
  const [mode, setMode] = useState('academic')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePolish = async () => {
    if (!selectedText.trim()) return
    setLoading(true)
    try {
      const polished = await window.api.invoke('paper:ai-polish', paperId, selectedText, mode) as string
      setResult(polished)
    } catch (err) {
      setResult(`Error: ${err}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 12 }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>AI Polish</h4>

      <div style={{ marginBottom: 8 }}>
        <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: '100%', padding: 6 }}>
          {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      {selectedText && (
        <div style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4, fontSize: 12, maxHeight: 120, overflow: 'auto' }}>
          <strong>Selected:</strong> {selectedText.slice(0, 200)}...
        </div>
      )}

      <button onClick={handlePolish} disabled={loading || !selectedText} style={{ width: '100%', marginBottom: 8 }}>
        {loading ? 'Polishing...' : 'Polish'}
      </button>

      {result && (
        <div style={{ marginBottom: 8 }}>
          <textarea value={result} readOnly style={{ width: '100%', height: 150, fontSize: 12, padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
          <button onClick={() => onApply(result)} style={{ marginTop: 4, width: '100%' }}>Apply</button>
        </div>
      )}
    </div>
  )
}
