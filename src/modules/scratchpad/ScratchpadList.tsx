import { Scratchpad } from '@/types'

export default function ScratchpadList({ items, activeId, onSelect, onCreate, onDelete }: {
  items: Scratchpad[]
  activeId: string
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '8px 16px',
      borderBottom: '1px solid #e0e0e0', overflowX: 'auto', flexShrink: 0
    }}>
      <button onClick={onCreate} style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }}>+ New</button>
      {items.map(item => (
        <div key={item.id}
          onClick={() => onSelect(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeId === item.id ? '#e8f0fe' : 'transparent',
            fontSize: 12
          }}>
          <span>{item.title}</span>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 10 }}>
            X
          </button>
        </div>
      ))}
    </div>
  )
}
