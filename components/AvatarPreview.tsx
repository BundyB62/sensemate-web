'use client'
import { useState } from 'react'

export default function AvatarPreview({ src, name, accent, fallbackEmoji }: {
  src?: string | null
  name: string
  accent: string
  fallbackEmoji: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Clickable avatar */}
      <div
        onClick={src ? (e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) } : undefined}
        style={{
          width: 78, height: 78, borderRadius: 22, overflow: 'hidden',
          border: `2px solid ${accent}55`,
          boxShadow: `0 0 30px ${accent}30, 0 0 60px ${accent}10`,
          background: `linear-gradient(135deg, ${accent}25, ${accent}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: src ? 'zoom-in' : 'default',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          if (src) {
            e.currentTarget.style.transform = 'scale(1.06)'
            e.currentTarget.style.boxShadow = `0 0 40px ${accent}50, 0 0 80px ${accent}20`
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = `0 0 30px ${accent}30, 0 0 60px ${accent}10`
        }}
      >
        {src
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          : <span style={{ fontSize: 32 }}>{fallbackEmoji}</span>
        }
      </div>

      {/* Fullscreen modal */}
      {open && src && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'avatar-modal-in 0.3s ease both',
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}
            style={{
              position: 'absolute', top: 24, right: 24, zIndex: 10,
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
            position: 'absolute', bottom: 32, left: 0, right: 0,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}>
              {name}
            </div>
          </div>

          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '85vw', maxHeight: '85vh',
              borderRadius: 24, overflow: 'hidden',
              boxShadow: `0 0 80px ${accent}30, 0 20px 60px rgba(0,0,0,0.5)`,
              border: `2px solid ${accent}40`,
              animation: 'avatar-img-in 0.35s cubic-bezier(0.34,1.2,0.64,1) both',
              cursor: 'default',
            }}
          >
            <img
              src={src}
              alt={name}
              style={{
                display: 'block',
                maxWidth: '85vw', maxHeight: '85vh',
                objectFit: 'contain',
              }}
            />
          </div>

          <style jsx>{`
            @keyframes avatar-modal-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes avatar-img-in {
              from { opacity: 0; transform: scale(0.85); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
