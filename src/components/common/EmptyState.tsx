export default function EmptyState({ title, description, action }: {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: '#666' }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ marginBottom: 16 }}>{description}</p>
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  )
}
