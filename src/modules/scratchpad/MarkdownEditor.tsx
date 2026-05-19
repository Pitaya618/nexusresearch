import { useRef } from 'react'

export default function MarkdownEditor({ content, onChange }: {
  content: string
  onChange: (value: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={e => onChange(e.target.value)}
      placeholder="Start writing your research notes...

Supports Markdown, LaTeX ($formula$), code blocks..."
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        padding: 24,
        fontSize: 15,
        lineHeight: 1.7,
        fontFamily: "'JetBrains Mono', monospace",
        resize: 'none',
        outline: 'none'
      }}
    />
  )
}
