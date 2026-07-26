import { useState } from 'react'

export default function Card({ children, style, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: hovered && onClick ? '#1c1c1c' : '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '20px 24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}
