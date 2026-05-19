export default function CompileLog({ result }: { result: any }) {
  if (!result) return null

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', maxHeight: 200, overflow: 'auto', background: '#1e1e1e', color: '#d4d4d4' }}>
      <div style={{ padding: '4px 12px', borderBottom: '1px solid #333', fontSize: 12 }}>
        <span style={{ color: result.success ? '#4ec9b0' : '#f44747' }}>
          {result.success ? 'Build succeeded' : 'Build failed'}
        </span>
        <span style={{ marginLeft: 8, color: '#888' }}>
          {result.errors.length} error(s), {result.errors.filter((e: any) => e.type === 'warning').length} warning(s)
        </span>
      </div>
      <pre style={{ padding: 12, fontSize: 11, lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap' }}>
        {result.log.slice(-3000)}
      </pre>
    </div>
  )
}
