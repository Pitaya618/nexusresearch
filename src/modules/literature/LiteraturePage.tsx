import { useState } from 'react'
import { useLiterature } from './hooks/useLiterature'
import LiteratureList from './LiteratureList'
import { Literature } from '@/types'

export default function LiteraturePage({ onSelectLiterature }: {
  onSelectLiterature?: (lit: Literature) => void
}) {
  const { items, loading, search, refresh } = useLiterature()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')

  const handleSearch = (value: string) => {
    setQuery(value)
    search(value)
  }

  const handleImport = () => {
    alert('Import dialog - to be implemented')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, padding: 16, borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search literature..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
        />
        <button onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}>
          {viewMode === 'list' ? 'Card View' : 'List View'}
        </button>
        <button onClick={handleImport}>+ Import PDF</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <LiteratureList
          items={items}
          loading={loading}
          viewMode={viewMode}
          onSelect={lit => onSelectLiterature?.(lit)}
          onImport={handleImport}
        />
      </div>
    </div>
  )
}
