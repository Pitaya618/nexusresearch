import { useState, useEffect, useCallback } from 'react'
import { Paper } from '@/types'
import LatexEditor from './LatexEditor'
import PdfPreview from './PdfPreview'
import FileTree from './FileTree'
import CompileLog from './CompileLog'
import CitationDialog from './CitationDialog'
import TemplateSelector from './TemplateSelector'
import AiPolishPanel from './AiPolishPanel'

interface CompileResult {
  success: boolean
  log: string
  pdfPath?: string
  errors: { line: number; message: string; type: string }[]
}

export default function WritingPage({ paper, onBack }: {
  paper: Paper
  onBack: () => void
}) {
  const [files, setFiles] = useState<string[]>([])
  const [activeFile, setActiveFile] = useState(paper.mainFile)
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null)
  const [compiling, setCompiling] = useState(false)
  const [showCitation, setShowCitation] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showAiPolish, setShowAiPolish] = useState(false)

  const loadFiles = useCallback(async () => {
    const fileList = await window.api.invoke('paper:list-files', paper.id) as string[]
    setFiles(fileList)
  }, [paper.id])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleCompile = async () => {
    setCompiling(true)
    try {
      const result = await window.api.invoke('paper:compile', paper.id) as CompileResult
      setCompileResult(result)
      // Refresh file list after compile (may produce aux files)
      await loadFiles()
    } finally {
      setCompiling(false)
    }
  }

  const handleInsertCitation = (citeKey: string) => {
    // Find the editor textarea and insert \cite{key} at cursor position
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = textarea.value.substring(0, start)
      const after = textarea.value.substring(end)
      const insertion = `\\cite{${citeKey}}`
      textarea.value = before + insertion + after
      // Trigger React change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set
      nativeInputValueSetter?.call(textarea, textarea.value)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      // Move cursor after inserted text
      textarea.selectionStart = textarea.selectionEnd = start + insertion.length
      textarea.focus()
    }
    setShowCitation(false)
  }

  const handleTemplateSelect = async (template: string) => {
    await window.api.invoke('paper:update', paper.id, { template })
    setShowTemplate(false)
  }

  const handleGetSelectedText = (): string => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      return textarea.value.substring(start, end)
    }
    return ''
  }

  const handleAiPolish = () => {
    const text = handleGetSelectedText()
    if (text.trim()) {
      setSelectedText(text)
      setShowAiPolish(true)
    }
  }

  const handleApplyPolished = (polished: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = textarea.value.substring(0, start)
      const after = textarea.value.substring(end)
      textarea.value = before + polished + after
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set
      nativeInputValueSetter?.call(textarea, textarea.value)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.focus()
    }
    setShowAiPolish(false)
  }

  const handleRefreshPreview = async () => {
    await handleCompile()
  }

  const pdfPath = compileResult?.pdfPath

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
        }}>
          Back
        </button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{paper.title}</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setShowCitation(true)} style={toolbarBtnStyle}>
          Insert Citation
        </button>
        <button onClick={() => setShowTemplate(true)} style={toolbarBtnStyle}>
          Template
        </button>
        <button onClick={handleAiPolish} style={toolbarBtnStyle}>
          AI Polish
        </button>
        <button
          onClick={handleCompile}
          disabled={compiling}
          style={{
            ...toolbarBtnStyle,
            background: compiling ? '#ccc' : '#2B5EA7',
            color: '#fff',
          }}
        >
          {compiling ? 'Compiling...' : 'Compile'}
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar: file tree + optional AI polish */}
        <div style={{
          width: 220,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <FileTree
            files={files}
            activeFile={activeFile}
            onSelect={setActiveFile}
          />
          {showAiPolish && selectedText && (
            <div style={{ borderTop: '1px solid #e0e0e0', flex: 1, overflow: 'auto' }}>
              <AiPolishPanel
                paperId={paper.id}
                selectedText={selectedText}
                onApply={handleApplyPolished}
              />
            </div>
          )}
        </div>

        {/* Center: editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <LatexEditor
            paperId={paper.id}
            filename={activeFile}
          />
        </div>

        {/* Right: PDF preview */}
        <div style={{
          width: '40%',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <PdfPreview
            pdfPath={pdfPath}
            onRefresh={handleRefreshPreview}
          />
        </div>
      </div>

      {/* Bottom: compile log */}
      {compileResult && (
        <div style={{
          maxHeight: 200,
          borderTop: '1px solid #e0e0e0',
          overflow: 'auto',
          flexShrink: 0,
        }}>
          <CompileLog result={compileResult} />
        </div>
      )}

      {/* Modals */}
      {showCitation && (
        <CitationDialog
          paperId={paper.id}
          onClose={() => setShowCitation(false)}
          onInsert={handleInsertCitation}
        />
      )}
      {showTemplate && (
        <TemplateSelector
          currentTemplate={paper.template}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplate(false)}
        />
      )}
    </div>
  )
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
}
