import { useState } from 'react'

export default function Button({ children, onClick, variant = 'primary', style, disabled }) {
  const [hovered, setHovered] = useState(false)

  const base = {
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'opacity 0.15s, background 0.15s',
  }

  const variants = {
    primary: {
      background: hovered ? '#e5e5e5' : '#ffffff',
      color: '#000000',
    },
    ghost: {
      background: 'transparent',
      color: '#9ca3af',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
    },
    danger: {
      background: '#ef4444',
      color: '#ffffff',
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}
