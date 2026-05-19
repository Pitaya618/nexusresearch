import { useState, useEffect } from 'react'
import { Literature, Annotation } from '@/types'
import PdfViewer from './PdfViewer'
import AnnotationPanel from './AnnotationPanel'
import MarkdownNote from './MarkdownNote'
import AiChatPanel from './AiChatPanel'

type RightTab = 'annotations' | 'note' | 'ai'

export default function ReadingPage({ literature, onBack }: {
  literature: Literature
  onBack: () => void
}) {
  const [rightTab, setRightTab] = useState<RightTab>('annotations')
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  const loadAnnotations = async () => {
    const data = await window.api.invoke('annotation:list', literature.id) as Annotation[]
    setAnnotations(data)
  }

  useEffect(() => { loadAnnotations() }, [literature.id])

  const handleDeleteAnnotation = async (id: string) => {
    await window.api.invoke('annotation:delete', id)
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
        <div>
          <h3 style={{ margin: 0, fontSize: 14 }}>{literature.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{literature.authors.join(', ')}</p>
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#999' }}>{annotations.length} annotations</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <PdfViewer
          pdfPath={literature.pdfPath}
          literatureId={literature.id}
          onAnnotationsChange={loadAnnotations}
        />

        <div style={{ width: 320, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
            {(['annotations', 'note', 'ai'] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{
                  flex: 1, padding: 8, border: 'none', cursor: 'pointer',
                  borderBottom: rightTab === tab ? '2px solid #2B5EA7' : '2px solid transparent',
                  background: 'none', fontWeight: rightTab === tab ? 600 : 400, fontSize: 13
                }}>
                {tab === 'annotations' ? 'Annotations' : tab === 'note' ? 'Note' : 'AI'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {rightTab === 'annotations' && (
              <AnnotationPanel
                annotations={annotations}
                onDelete={handleDeleteAnnotation}
              />
            )}
            {rightTab === 'note' && (
              <MarkdownNote literatureId={literature.id} />
            )}
            {rightTab === 'ai' && (
              <AiChatPanel literatureId={literature.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
