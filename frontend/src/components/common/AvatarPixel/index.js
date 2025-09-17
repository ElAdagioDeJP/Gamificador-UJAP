import React from 'react'
import './styles.css'

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const initials = parts.map(p => p[0]).join('')
  return initials.toUpperCase()
}

export default function AvatarPixel({ name, src, size = 50, className = '' }) {
  const initials = getInitials(name)
  const style = { width: size, height: size }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`avatar-pixel-img ${className}`}
        style={style}
        onError={(e) => {
          // Si la imagen falla, reemplazar por iniciales
          const parent = e.currentTarget.parentElement
          if (parent) {
            const span = document.createElement('span')
            span.className = `avatar-pixel-initials ${className}`
            span.style.width = `${size}px`
            span.style.height = `${size}px`
            span.textContent = initials
            parent.replaceChild(span, e.currentTarget)
          }
        }}
      />
    )
  }

  return (
    <span className={`avatar-pixel-initials ${className}`} style={style} title={name}>
      {initials}
    </span>
  )
}
