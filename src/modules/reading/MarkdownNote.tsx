import { useState, useEffect } from 'react'
import { marked } from 'marked'

export default function MarkdownNote({ literatureId }: { literatureId: string }) {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.api.invoke('reading-note:get', literatureId).then((note: any) => {
      setContent(note?.content || '')
    })
  }, [literatureId])

  const handleSave = async () => {
    setSaving(true)
    await window.api.invoke('reading-note:update', literatureId, content)
    setSaving(false)
  }

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(handleSave, 2000)
    return () => clearTimeout(timer)
  }, [content])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 8 }}>
        <button onClick={() => setPreview(false)} style={{ fontWeight: !preview ? 600 : 400 }}>Edit</button>
        <button onClick={() => setPreview(true)} style={{ fontWeight: preview ? 600 : 400 }}>Preview</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#999' }}>{saving ? 'Saving...' : 'Saved'}</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {preview ? (
          <div
            style={{ padding: 16, fontSize: 14, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
          />
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your reading notes here (Markdown supported)..."
            style={{
              width: '100%', height: '100%', border: 'none', padding: 16,
              fontSize: 14, lineHeight: 1.6, resize: 'none', fontFamily: 'monospace'
            }}
          />
        )}
      </div>
    </div>
  )
}
