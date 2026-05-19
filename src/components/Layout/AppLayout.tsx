import { useState } from 'react'
import Sidebar, { ModuleId } from './Sidebar'

export default function AppLayout({ children }: {
  children: (module: ModuleId) => React.ReactNode
}) {
  const [activeModule, setActiveModule] = useState<ModuleId>('literature')

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Sidebar active={activeModule} onSelect={setActiveModule} />
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children(activeModule)}
      </div>
    </div>
  )
}
