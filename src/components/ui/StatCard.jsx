export default function StatCard({ label, value, color, style, className = '' }) {
  return (
    <div
      className={`metric-card ${className}`.trim()}
      style={{
        borderLeft: `4px solid ${color || 'var(--border-color)'}`,
        flex: '1 1 220px',
        minWidth: '180px',
        width: '100%',
        ...style,
      }}
    >
      <strong style={color ? { color } : undefined}>{value ?? '—'}</strong>
      <p>{label}</p>
    </div>
  )
}
