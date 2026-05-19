import { useState, useEffect, useCallback } from 'react'
import AppLayout from './components/Layout/AppLayout'
import { ModuleId } from './components/Layout/Sidebar'
import LiteraturePage from './modules/literature/LiteraturePage'
import ReadingPage from './modules/reading/ReadingPage'
import ScratchpadPage from './modules/scratchpad/ScratchpadPage'
import WritingPage from './modules/writing/WritingPage'
import SettingsPage from './components/Settings/SettingsPage'
import OnboardingFlow from './components/Onboarding/OnboardingFlow'
import { Literature, Paper } from './types'

// Paper list component for the writing module
function PaperList({ onSelectPaper }: {
  onSelectPaper: (paper: Paper) => void
}) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)

  const loadPapers = useCallback(async () => {
    setLoading(true)
    const data = await window.api.invoke('paper:list') as Paper[]
    setPapers(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadPapers() }, [loadPapers])

  const handleCreate = async () => {
    const title = prompt('Paper title:')
    if (!title?.trim()) return
    const targetJournal = prompt('Target journal:', 'IEEE') || ''
    await window.api.invoke('paper:create', { title: title.trim(), targetJournal })
    await loadPapers()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: '#999' }}>Loading papers...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: 16,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Papers</h2>
        <span style={{ flex: 1 }} />
        <button
          onClick={handleCreate}
          style={{
            padding: '8px 16px',
            background: '#2B5EA7',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          + New Paper
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {papers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#999',
            marginTop: 48,
          }}>
            <div style={{ fontSize: 48 }}>📄</div>
            <p>No papers yet</p>
            <p style={{ fontSize: 13 }}>Click "New Paper" to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {papers.map(paper => (
              <button
                key={paper.id}
                onClick={() => onSelectPaper(paper)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: 16,
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#2B5EA7'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(43,94,167,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>
                  {paper.title}
                </span>
                <span style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {paper.targetJournal || 'No target journal'} · {new Date(paper.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checked, setChecked] = useState(false)

  // Check if onboarding is needed on mount
  useEffect(() => {
    window.api.invoke('model-config:list').then((configs: any) => {
      if (configs.length === 0) setShowOnboarding(true)
      setChecked(true)
    })
  }, [])

  // Full-page navigation states
  const [selectedLiterature, setSelectedLiterature] = useState<Literature | null>(null)
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  // Handle selecting a literature item for reading
  const handleSelectLiterature = (lit: Literature) => {
    setSelectedLiterature(lit)
  }

  // Handle back from reading page
  const handleBackFromReading = () => {
    setSelectedLiterature(null)
  }

  // Handle selecting a paper for editing
  const handleSelectPaper = (paper: Paper) => {
    setSelectedPaper(paper)
  }

  // Handle back from writing page
  const handleBackFromWriting = () => {
    setSelectedPaper(null)
  }

  // Loading state while checking for model configs
  if (!checked) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    )
  }

  // Onboarding flow for first run
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
  }

  // Full-page states: ReadingPage
  if (selectedLiterature) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <ReadingPage
          literature={selectedLiterature}
          onBack={handleBackFromReading}
        />
      </div>
    )
  }

  // Full-page states: WritingPage
  if (selectedPaper) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <WritingPage
          paper={selectedPaper}
          onBack={handleBackFromWriting}
        />
      </div>
    )
  }

  // Normal layout with sidebar routing
  return (
    <AppLayout>
      {(module: ModuleId) => {
        switch (module) {
          case 'literature':
            return <LiteraturePage onSelectLiterature={handleSelectLiterature} />
          case 'scratchpad':
            return <ScratchpadPage />
          case 'writing':
            return <PaperList onSelectPaper={handleSelectPaper} />
          case 'settings':
            return <SettingsPage />
          default:
            return <LiteraturePage onSelectLiterature={handleSelectLiterature} />
        }
      }}
    </AppLayout>
  )
}

export default App
