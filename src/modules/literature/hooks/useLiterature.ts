import { useState, useEffect, useCallback } from 'react'
import { Literature } from '@/types'

export function useLiterature() {
  const [items, setItems] = useState<Literature[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await window.api.invoke('literature:list') as Literature[]
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const search = async (query: string) => {
    if (!query) return refresh()
    const data = await window.api.invoke('literature:search', query) as Literature[]
    setItems(data)
  }

  const remove = async (id: string) => {
    await window.api.invoke('literature:delete', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const update = async (id: string, data: Partial<Literature>) => {
    const updated = await window.api.invoke('literature:update', id, data) as Literature
    setItems(prev => prev.map(i => i.id === id ? updated : i))
    return updated
  }

  return { items, loading, refresh, search, remove, update }
}
