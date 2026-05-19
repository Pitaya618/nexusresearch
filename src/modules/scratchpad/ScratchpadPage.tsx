import { useState, useEffect, useCallback } from 'react'
import { Scratchpad, ChatMessage } from '@/types'
import MarkdownEditor from './MarkdownEditor'
import AiChat from './AiChat'
import ScratchpadList from './ScratchpadList'

export default function ScratchpadPage() {
  const [items, setItems] = useState<Scratchpad[]>([])
  const [activeId, setActiveId] = useState('')
  const [content, setContent] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const loadItems = useCallback(async () => {
    const data = await window.api.invoke('scratchpad:list') as Scratchpad[]
    setItems(data)
    if (data.length > 0 && !activeId) {
      setActiveId(data[0].id)
      setContent(data[0].content)
      setChatHistory(data[0].chatHistory || [])
    }
  }, [activeId])

  useEffect(() => { loadItems() }, [])

  const handleSelect = async (id: string) => {
    if (activeId) {
      await window.api.invoke('scratchpad:update', activeId, { content, chatHistory })
    }
    const pad = await window.api.invoke('scratchpad:get', id) as Scratchpad
    setActiveId(id)
    setContent(pad?.content || '')
    setChatHistory(pad?.chatHistory || [])
  }

  const handleCreate = async () => {
    const pad = await window.api.invoke('scratchpad:create', 'New Scratchpad') as Scratchpad
    await loadItems()
    handleSelect(pad.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scratchpad?')) return
    await window.api.invoke('scratchpad:delete', id)
    if (activeId === id) {
      setActiveId('')
      setContent('')
      setChatHistory([])
    }
    loadItems()
  }

  // Auto-save with debounce
  useEffect(() => {
    if (!activeId) return
    const timer = setTimeout(async () => {
      await window.api.invoke('scratchpad:update', activeId, { content, chatHistory })
    }, 2000)
    return () => clearTimeout(timer)
  }, [content, chatHistory, activeId])

  const handleAiChat = async (question: string): Promise<string> => {
    const answer = await window.api.invoke('scratchpad:ai-chat', content, chatHistory, question) as string
    setChatHistory(prev => [...prev, { role: 'user', content: question, timestamp: new Date().toISOString() }, { role: 'assistant', content: answer, timestamp: new Date().toISOString() }])
    return answer
  }

  const handleAiEdit = async (instruction: string): Promise<string> => {
    const newContent = await window.api.invoke('scratchpad:ai-edit', content, instruction) as string
    setContent(newContent)
    return newContent
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScratchpadList
        items={items}
        activeId={activeId}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, borderRight: '1px solid #e0e0e0' }}>
          <MarkdownEditor content={content} onChange={setContent} />
        </div>
        <div style={{ width: 400 }}>
          <AiChat
            content={content}
            chatHistory={chatHistory}
            onSend={handleAiChat}
            onEdit={handleAiEdit}
          />
        </div>
      </div>
    </div>
  )
}
