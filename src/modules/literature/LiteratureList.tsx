import { Literature } from '@/types'
import EmptyState from '@/components/common/EmptyState'

type ViewMode = 'list' | 'card'

export default function LiteratureList({ items, loading, viewMode, onSelect, onImport }: {
  items: Literature[]
  loading: boolean
  viewMode: ViewMode
  onSelect: (lit: Literature) => void
  onImport: () => void
}) {
  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>

  if (items.length === 0) {
    return (
      <EmptyState
        title="No literature yet"
        description="Import your first PDF to get started"
        action={{ label: 'Import PDF', onClick: onImport }}
      />
    )
  }

  if (viewMode === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
        {items.map(lit => (
          <div key={lit.id}
            onClick={() => onSelect(lit)}
            style={{
              border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <h4 style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>{lit.title || 'Untitled'}</h4>
            <p style={{ color: '#666', fontSize: 12, margin: '4px 0' }}>{lit.authors.join(', ')}</p>
            <p style={{ color: '#999', fontSize: 12, margin: 0 }}>{lit.journal} ({lit.year})</p>
            {lit.aiSummary && (
              <p style={{ fontSize: 12, color: '#555', marginTop: 8, lineHeight: 1.4 }}>
                {lit.aiSummary.slice(0, 120)}...
              </p>
            )}
            {lit.tags.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {lit.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '2px 6px', background: '#f0f0f0', borderRadius: 4 }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
          <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Authors</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Year</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Tags</th>
        </tr>
      </thead>
      <tbody>
        {items.map(lit => (
          <tr key={lit.id} onClick={() => onSelect(lit)} style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
            <td style={{ padding: 8 }}>{lit.title || 'Untitled'}</td>
            <td style={{ padding: 8, color: '#666' }}>{lit.authors.slice(0, 2).join(', ')}</td>
            <td style={{ padding: 8, color: '#666' }}>{lit.year}</td>
            <td style={{ padding: 8 }}>
              {lit.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '2px 6px', background: '#f0f0f0', borderRadius: 4, marginRight: 4 }}>{tag}</span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
