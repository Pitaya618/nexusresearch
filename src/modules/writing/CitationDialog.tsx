import { useState, useEffect } from 'react'
import { Literature } from '@/types'

export default function CitationDialog({ paperId, onClose, onInsert }: {
  paperId: string
  onClose: () => void
  onInsert: (citeKey: string) => void
}) {
  const [literature, setLiterature] = useState<Literature[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.api.invoke('literature:list').then(data => setLiterature(data as Literature[]))
  }, [])

  const filtered = literature.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.authors.some(a => a.toLowerCase().includes(search.toLowerCase()))
  )

  const generateCiteKey = (lit: Literature) => {
    const firstAuthor = lit.authors[0]?.split(' ').pop() || 'unknown'
    return `${firstAuthor}${lit.year}`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 500, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Insert Citation</h3>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or author..."
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, marginBottom: 12 }}
        />
        <div style={{ flex: 1, overflow: 'auto', maxHeight: 400 }}>
          {filtered.map(lit => {
            const citeKey = generateCiteKey(lit)
            return (
              <div key={lit.id}
                onClick={() => { onInsert(citeKey); onClose() }}
                style={{
                  padding: 8, borderRadius: 4, cursor: 'pointer', marginBottom: 4,
                  border: '1px solid #eee'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>{lit.title}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{lit.authors.join(', ')} ({lit.year})</div>
                <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{'\cite{' + citeKey + '}'}</div>
              </div>
            )
          })}
        </div>
        <button onClick={onClose} style={{ marginTop: 12, alignSelf: 'flex-end' }}>Close</button>
      </div>
    </div>
  )
}
