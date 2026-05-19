import { useState, useEffect } from 'react'

export default function LatexEditor({ paperId, filename, onChange }: {
  paperId: string
  filename: string
  onChange?: (content: string) => void
}) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.api.invoke('paper:read-file', paperId, filename).then((data: any) => {
      setContent(data as string || '')
    })
  }, [paperId, filename])

  // Auto-save with debounce
  useEffect(() => {
    if (!content) return
    const timer = setTimeout(async () => {
      setSaving(true)
      await window.api.invoke('paper:write-file', paperId, filename, content)
      setSaving(false)
      onChange?.(content)
    }, 1500)
    return () => clearTimeout(timer)
  }, [content])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '4px 12px', borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>{filename}</span>
        <span>{saving ? 'Saving...' : 'Saved'}</span>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{
          flex: 1, border: 'none', padding: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, lineHeight: 1.5, resize: 'none',
          tabSize: 2, outline: 'none'
        }}
        spellCheck={false}
      />
    </div>
  )
}
