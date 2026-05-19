import { Annotation } from '@/types'

export default function AnnotationPanel({ annotations, onDelete, colorFilter }: {
  annotations: Annotation[]
  onDelete: (id: string) => void
  colorFilter?: string
}) {
  const filtered = colorFilter
    ? annotations.filter(a => a.color === colorFilter)
    : annotations

  if (filtered.length === 0) {
    return <p style={{ padding: 16, color: '#999', fontSize: 13 }}>No annotations yet</p>
  }

  return (
    <div style={{ padding: 8 }}>
      {filtered.map(a => (
        <div key={a.id} style={{
          padding: 8, marginBottom: 8, borderLeft: `3px solid ${a.color}`,
          background: '#fafafa', borderRadius: 4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <span style={{ fontSize: 11, color: '#999' }}>
              p.{a.page} - {a.colorLabel}
            </span>
            <button onClick={() => onDelete(a.id)}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 11 }}>
              X
            </button>
          </div>
          <p style={{ margin: '4px 0', fontSize: 13, lineHeight: 1.4 }}>{a.text}</p>
          {a.note && <p style={{ margin: 0, fontSize: 12, color: '#666', fontStyle: 'italic' }}>{a.note}</p>}
        </div>
      ))}
    </div>
  )
}
