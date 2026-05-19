import { useEffect, useState, useRef } from 'react'

export default function PdfPreview({ pdfPath, onRefresh }: {
  pdfPath?: string
  onRefresh?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '4px 12px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
        <span>PDF Preview</span>
        <span style={{ flex: 1 }} />
        <button onClick={onRefresh} style={{ fontSize: 11 }}>Refresh</button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', background: '#555' }}>
        {pdfPath ? (
          <iframe
            ref={iframeRef}
            src={`file://${pdfPath}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
            Compile to preview PDF
          </div>
        )}
      </div>
    </div>
  )
}
