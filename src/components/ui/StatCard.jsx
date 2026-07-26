const styles = {
  card: {
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '24px',
    flex: 1,
  },
  number: (color) => ({
    fontSize: '32px',
    fontWeight: '700',
    color: color || '#ffffff',
    lineHeight: 1.1,
    marginBottom: '6px',
  }),
  label: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '400',
  },
}

export default function StatCard({ label, value, color }) {
  return (
    <div style={styles.card}>
      <div style={styles.number(color)}>{value ?? '—'}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}
