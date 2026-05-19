import ApiKeyManager from './ApiKeyManager'
import ModelBinding from './ModelBinding'

export default function SettingsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h2>Settings</h2>
      <ApiKeyManager />
      <hr style={{ margin: '24px 0' }} />
      <ModelBinding />
    </div>
  )
}
