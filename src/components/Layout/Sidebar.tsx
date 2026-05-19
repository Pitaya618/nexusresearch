export type ModuleId = 'literature' | 'reading' | 'scratchpad' | 'writing' | 'settings'

const NAV_ITEMS = [
  { id: 'literature' as ModuleId, label: 'Literature', icon: '📚' },
  { id: 'scratchpad' as ModuleId, label: 'Scratchpad', icon: '📝' },
  { id: 'writing' as ModuleId, label: 'Writing', icon: '📄' },
  { id: 'settings' as ModuleId, label: 'Settings', icon: '⚙️' }
]

export default function Sidebar({ active, onSelect }: {
  active: ModuleId
  onSelect: (id: ModuleId) => void
}) {
  return (
    <div style={{
      width: 200,
      background: '#f8f9fa',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* App name */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#2B5EA7',
          letterSpacing: '-0.5px',
        }}>
          NexusResearch
        </div>
        <div style={{
          fontSize: 11,
          color: '#999',
          marginTop: 2,
        }}>
          Academic Research Assistant
        </div>
      </div>

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? '#e8f0fe' : 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: isActive ? '#2B5EA7' : '#333',
                fontWeight: isActive ? 600 : 400,
                borderRight: isActive ? '3px solid #2B5EA7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f0f0f0'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e0e0e0',
        fontSize: 11,
        color: '#999',
      }}>
        v0.1.0 MVP
      </div>
    </div>
  )
}
