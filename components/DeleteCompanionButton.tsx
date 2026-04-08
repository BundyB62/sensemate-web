'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCompanionButton({ companionId, companionName }: {
  companionId: string
  companionName: string
}) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) {
        setShowMenu(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/companions/${companionId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        setDeleting(false)
        setConfirming(false)
      }
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* ⋯ trigger button */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setShowMenu(s => !s) }}
        style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, letterSpacing: 2, transition: 'all 0.2s',
          lineHeight: 1,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
        }}
      >⋯</button>

      {/* Dropdown menu */}
      {showMenu && (
        <div onClick={e => e.preventDefault()} style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6,
          minWidth: 180, borderRadius: 14,
          background: 'rgba(14,10,28,0.97)', backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden', zIndex: 50,
          animation: 'fadeIn 0.15s ease',
        }}>
          {!confirming ? (
            <button onClick={handleDelete} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '12px 16px',
              background: 'transparent', border: 'none',
              color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.15s',
            }}
              onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 15 }}>🗑</span>
              Delete {companionName}
            </button>
          ) : (
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: 'rgba(239,68,68,0.8)', marginBottom: 12, fontWeight: 500 }}>
                {deleting ? 'Deleting...' : `Delete ${companionName} and all messages?`}
              </div>
              {!deleting && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDelete} style={{
                    flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', cursor: 'pointer',
                  }}>Yes, delete</button>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirming(false); setShowMenu(false) }} style={{
                    flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  }}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
