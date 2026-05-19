import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/types'

export default function AiChat({ content, chatHistory, onSend, onEdit }: {
  content: string
  chatHistory: ChatMessage[]
  onSend: (question: string) => Promise<string>
  onEdit: (instruction: string) => Promise<string>
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages(chatHistory)
  }, [chatHistory])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question, timestamp: new Date().toISOString() }])
    setLoading(true)

    try {
      const answer = await onSend(question)
      setMessages(prev => [...prev, { role: 'assistant', content: answer, timestamp: new Date().toISOString() }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err}`, timestamp: new Date().toISOString() }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>AI Assistant</h4>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {messages.length === 0 && (
          <p style={{ color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
            Discuss your research ideas with AI...
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12, padding: 12, borderRadius: 8,
            background: msg.role === 'user' ? '#f0f6ff' : '#f5f5f5',
            fontSize: 13, lineHeight: 1.6
          }}>
            <strong style={{ fontSize: 12, color: msg.role === 'user' ? '#2B5EA7' : '#666' }}>
              {msg.role === 'user' ? 'You' : 'AI'}
            </strong>
            <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          </div>
        ))}
        {loading && <p style={{ color: '#999', fontSize: 13 }}>Thinking...</p>}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your research..."
          style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  )
}
