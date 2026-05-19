export default function FileTree({ files, activeFile, onSelect }: {
  files: string[]
  activeFile: string
  onSelect: (filename: string) => void
}) {
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666' }}>Project Files</h4>
      {files.map(f => (
        <div key={f} onClick={() => onSelect(f)}
          style={{
            padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
            background: activeFile === f ? '#e8f0fe' : 'transparent',
            fontFamily: 'monospace'
          }}>
          {f}
        </div>
      ))}
    </div>
  )
}
