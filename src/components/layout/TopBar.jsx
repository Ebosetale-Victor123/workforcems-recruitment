const styles = {
  topbar: {
    background: '#000000',
    padding: '24px 32px',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
  },
  primaryBtn: {
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
}

export default function TopBar({ title, action }) {
  return (
    <div style={styles.topbar}>
      <h1 style={styles.title}>{title}</h1>
      {action && (
        <button style={styles.primaryBtn} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
