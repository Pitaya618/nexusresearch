import { useState } from 'react'
import { Literature } from '@/types'

export default function LiteratureDetail({ literature, onClose, onOpenReading }: {
  literature: Literature
  onClose: () => void
  onOpenReading?: (lit: Literature) => void
}) {
  const [activeTab, setActiveTab] = useState<'abstract' | 'ai' | 'note'>('abstract')

  const copyCitation = (format: string) => {
    const formats = literature.citationFormats as any
    const text = formats?.[format] || ''
    navigator.clipboard.writeText(text)
    alert('Citation copied!')
  }

  return (
    <div style={{ width: 360, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <h3 style={{ margin: 0, fontSize: 14 }}>{literature.title || 'Untitled'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
        </div>
        <p style={{ color: '#666', fontSize: 12, margin: '4px 0' }}>{literature.authors.join(', ')}</p>
        <p style={{ color: '#999', fontSize: 12, margin: 0 }}>{literature.journal} ({literature.year})</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
        {(['abstract', 'ai', 'note'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: 8, border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #2B5EA7' : '2px solid transparent',
              background: 'none', fontWeight: activeTab === tab ? 600 : 400
            }}>
            {tab === 'abstract' ? 'Abstract' : tab === 'ai' ? 'AI Summary' : 'Note'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        {activeTab === 'abstract' && (
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{literature.abstract || 'No abstract available'}</p>
        )}
        {activeTab === 'ai' && (
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{literature.aiSummary || 'AI summary not generated yet'}</p>
        )}
        {activeTab === 'note' && (
          <p style={{ fontSize: 13, color: '#999' }}>Open in Reading module to take notes</p>
        )}
      </div>

      <div style={{ padding: 16, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onOpenReading?.(literature)}>Open Reading</button>
        <button onClick={() => copyCitation('apa')}>Copy APA</button>
        <button onClick={() => copyCitation('mla')}>Copy MLA</button>
        <button onClick={() => copyCitation('gb_t_7714')}>Copy GB/T</button>
      </div>
    </div>
  )
}
