import { useState } from 'react'

const TEMPLATES = [
  { id: 'general', name: 'General Academic', description: 'APA-style general paper' },
  { id: 'ieee', name: 'IEEE Transactions', description: 'Computer science / EE' },
  { id: 'arxiv', name: 'arXiv Preprint', description: 'arXiv preprint format' },
  { id: 'gbt7714', name: 'GB/T 7714', description: 'Chinese academic standard' },
  { id: 'thesis', name: 'Thesis', description: 'Master/PhD thesis' }
]

export default function TemplateSelector({ currentTemplate, onSelect, onClose }: {
  currentTemplate: string
  onSelect: (template: string) => void
  onClose: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 400 }}>
        <h3 style={{ margin: 0, marginBottom: 16 }}>Select Template</h3>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => { onSelect(t.id); onClose() }}
            style={{
              padding: 12, borderRadius: 8, cursor: 'pointer', marginBottom: 8,
              border: currentTemplate === t.id ? '2px solid #2B5EA7' : '2px solid #eee',
              background: currentTemplate === t.id ? '#f0f6ff' : 'white'
            }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{t.description}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 8 }}>Cancel</button>
      </div>
    </div>
  )
}
