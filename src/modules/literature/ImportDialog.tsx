import { useState, useRef } from 'react'

export default function ImportDialog({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<{ id: string; status: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'))
    setFiles(prev => [...prev, ...dropped])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleImport = async () => {
    setImporting(true)
    const paths = await Promise.all(files.map(async f => {
      return (f as any).path || f.name
    }))
    const importResults = await window.api.invoke('literature:import', paths) as { id: string; status: string }[]
    setResults(importResults)
    setImporting(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 500, maxHeight: '80vh', overflow: 'auto' }}>
        <h2 style={{ margin: 0, marginBottom: 16 }}>Import PDF Literature</h2>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed #ccc', borderRadius: 8, padding: 32, textAlign: 'center',
            cursor: 'pointer', marginBottom: 16
          }}
        >
          <p>Drag & drop PDF files here</p>
          <p style={{ color: '#999', fontSize: 12 }}>or click to browse</p>
          <input ref={inputRef} type="file" accept=".pdf" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>

        {files.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p>{files.length} file(s) selected:</p>
            <ul style={{ fontSize: 12, maxHeight: 120, overflow: 'auto' }}>
              {files.map((f, i) => <li key={i}>{f.name}</li>)}
            </ul>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p>Import results:</p>
            <ul style={{ fontSize: 12 }}>
              {results.map((r, i) => (
                <li key={i} style={{ color: r.status === 'imported' ? 'green' : 'orange' }}>
                  {r.status}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose}>Close</button>
          <button onClick={handleImport} disabled={importing || files.length === 0}>
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
