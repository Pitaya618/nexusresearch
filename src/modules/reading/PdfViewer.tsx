import { useEffect, useRef, useState } from 'react'
import { Annotation } from '@/types'
import AnnotationToolbar from './AnnotationToolbar'

const COLORS = [
  { hex: '#4A90D9', label: 'Method' },
  { hex: '#E74C3C', label: 'Conclusion' },
  { hex: '#2ECC71', label: 'Innovation' },
  { hex: '#F1C40F', label: 'Question' },
  { hex: '#9B59B6', label: 'Formula' }
]

export default function PdfViewer({ pdfPath, literatureId, onAnnotationsChange }: {
  pdfPath: string
  literatureId: string
  onAnnotationsChange?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
  const [activeColor, setActiveColor] = useState(COLORS[0])

  useEffect(() => {
    loadAnnotations()
  }, [literatureId])

  const loadAnnotations = async () => {
    const data = await window.api.invoke('annotation:list', literatureId) as Annotation[]
    setAnnotations(data)
  }

  const handleTextSelect = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim()
      setSelectedText(text)
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 10 })
      setShowToolbar(true)
    }
  }

  const handleHighlight = async () => {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    if (!range) return

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const rect = range.getBoundingClientRect()
    const annotation = await window.api.invoke('annotation:create', {
      literatureId,
      page: currentPage,
      type: 'highlight',
      rect: {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        w: rect.width,
        h: rect.height
      },
      color: activeColor.hex,
      colorLabel: activeColor.label,
      text: selectedText
    }) as Annotation

    setAnnotations(prev => [...prev, annotation])
    setShowToolbar(false)
    selection?.removeAllRanges()
    onAnnotationsChange?.()
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Prev</button>
        <span style={{ fontSize: 13 }}>{currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
        <span style={{ flex: 1 }} />
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>-</button>
        <span style={{ fontSize: 13 }}>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.2))}>+</button>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}
        onMouseUp={handleTextSelect}>

        <div style={{
          background: '#888', padding: 16, display: 'flex', justifyContent: 'center',
          minHeight: '100%'
        }}>
          <div style={{
            background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            width: 800 * scale, minHeight: 1100 * scale, position: 'relative'
          }}>
            {/* PDF page rendered here via canvas - simplified placeholder */}
            <div style={{ padding: 40 * scale, fontSize: 14 * scale, lineHeight: 1.6 }}>
              <p style={{ color: '#999' }}>PDF Page {currentPage}</p>
            </div>

            {/* Render highlights */}
            {annotations
              .filter(a => a.page === currentPage && a.type === 'highlight')
              .map(a => (
                <div key={a.id} style={{
                  position: 'absolute',
                  left: a.rect.x, top: a.rect.y,
                  width: a.rect.w, height: a.rect.h,
                  background: a.color + '40',
                  borderLeft: `3px solid ${a.color}`,
                  cursor: 'pointer'
                }} title={a.colorLabel} />
              ))}
          </div>
        </div>

        {showToolbar && (
          <AnnotationToolbar
            x={toolbarPos.x}
            y={toolbarPos.y}
            colors={COLORS}
            activeColor={activeColor}
            onSelectColor={setActiveColor}
            onHighlight={handleHighlight}
            onAddNote={() => {/* TODO */ }}
            onClose={() => setShowToolbar(false)}
          />
        )}
      </div>
    </div>
  )
}
