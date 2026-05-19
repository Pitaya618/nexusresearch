export default function AnnotationToolbar({ x, y, colors, activeColor, onSelectColor, onHighlight, onAddNote, onClose }: {
  x: number
  y: number
  colors: { hex: string; label: string }[]
  activeColor: { hex: string; label: string }
  onSelectColor: (c: { hex: string; label: string }) => void
  onHighlight: () => void
  onAddNote: () => void
  onClose: () => void
}) {
  return (
    <div style={{
      position: 'fixed', left: x - 120, top: y - 50, zIndex: 1000,
      background: 'white', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      padding: 8, display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
        {colors.map(c => (
          <div key={c.hex}
            onClick={() => onSelectColor(c)}
            style={{
              width: 24, height: 24, borderRadius: '50%', background: c.hex,
              border: activeColor.hex === c.hex ? '2px solid #333' : '2px solid transparent',
              cursor: 'pointer'
            }}
            title={c.label} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={onHighlight} style={{ fontSize: 12, padding: '4px 8px' }}>Highlight</button>
        <button onClick={onAddNote} style={{ fontSize: 12, padding: '4px 8px' }}>Note</button>
        <button onClick={onClose} style={{ fontSize: 12, padding: '4px 8px', background: '#f5f5f5' }}>X</button>
      </div>
    </div>
  )
}
