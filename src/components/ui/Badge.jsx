const statusStyles = {
  open: { color: '#22c55e', fontWeight: '600', fontSize: '13px' },
  closed: {
    background: '#2a2a2a',
    color: '#9ca3af',
    borderRadius: '6px',
    padding: '3px 10px',
    fontSize: '12px',
  },
  draft: { color: '#f97316', fontWeight: '600', fontSize: '13px' },
  filled: { color: '#3b82f6', fontWeight: '600', fontSize: '13px' },
}

const stageStyles = {
  applied: { color: '#9ca3af' },
  screening: { color: '#f97316' },
  interview: { color: '#3b82f6' },
  offered: { color: '#22c55e' },
  hired: { color: '#22c55e', fontWeight: '600' },
  rejected: { color: '#ef4444' },
}

export function StatusBadge({ status }) {
  const s = statusStyles[status?.toLowerCase()] || { color: '#9ca3af' }
  return <span style={s}>{status}</span>
}

export function StageBadge({ stage }) {
  const s = stageStyles[stage?.toLowerCase()] || { color: '#9ca3af' }
  return (
    <span style={{ fontSize: '13px', fontWeight: '500', ...s }}>
      {stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : '—'}
    </span>
  )
}
