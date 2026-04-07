'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function AvatarPreview({ src, name, accent = '#e91e8c', fallbackEmoji = '😐', size = 78, borderRadius = 22 }: {
  src?: string | null
  name: string
  accent?: string
  fallbackEmoji?: string
  size?: number
  borderRadius?: number
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closingRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (closingRef.current) return
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    // Block any click events for a short period after closing
    // to prevent the underlying Link from being triggered
    closingRef.current = true
    setTimeout(() => { closingRef.current = false }, 300)
  }

  const modal = open && src ? (
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClose() }}
      onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
        animation: 'avp-fade-in 0.25s ease both',
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose() }}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 10,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        ✕
      </button>

      {/* Name */}
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 24, fontWeight: 700, color: 'white',
          textShadow: '0 2px 16px rgba(0,0,0,0.7)',
        }}>
          {name}
        </div>
      </div>

      {/* Image container */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '85vh',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: `0 0 100px ${accent}40, 0 24px 80px rgba(0,0,0,0.6)`,
          border: `2px solid ${accent}50`,
          animation: 'avp-scale-in 0.3s cubic-bezier(0.34,1.2,0.64,1) both',
          cursor: 'default',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          style={{
            display: 'block',
            maxWidth: '90vw', maxHeight: '85vh',
            objectFit: 'contain',
          }}
        />
      </div>

      <style>{`
        @keyframes avp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes avp-scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  ) : null

  return (
    <>
      {/* Clickable avatar thumbnail */}
      <div
        onClick={src ? handleOpen : undefined}
        onMouseDown={src ? (e) => { e.stopPropagation() } : undefined}
        style={{
          width: size, height: size, borderRadius, overflow: 'hidden',
          border: `2px solid ${accent}55`,
          boxShadow: `0 0 20px ${accent}20`,
          background: `linear-gradient(135deg, ${accent}25, ${accent}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: src ? 'zoom-in' : 'default',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (src) {
            e.currentTarget.style.transform = 'scale(1.08)'
            e.currentTarget.style.boxShadow = `0 0 30px ${accent}40`
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = `0 0 20px ${accent}20`
        }}
      >
        {src
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          : <span style={{ fontSize: Math.round(size * 0.4) }}>{fallbackEmoji}</span>
        }
      </div>

      {/* Portal modal to document.body */}
      {mounted && modal && createPortal(modal, document.body)}
    </>
  )
}
