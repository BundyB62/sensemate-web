'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCompanionButton({ companionId, companionName }: {
  companionId: string
  companionName: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        console.error('Delete failed')
        setDeleting(false)
        setConfirming(false)
      }
    } catch (err) {
      console.error(err)
      setDeleting(false)
      setConfirming(false)
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(false)
  }

  if (deleting) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 100,
        background: 'rgba(239,68,68,0.1)',
        fontSize: 12, color: 'rgba(239,68,68,0.6)',
      }}>
        Deleting...
      </div>
    )
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.preventDefault()}>
        <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', fontWeight: 500 }}>
          Delete {companionName}?
        </span>
        <button
          onClick={handleDelete}
          style={{
            padding: '5px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '5px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleDelete}
      title={`Delete ${companionName}`}
      style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
        e.currentTarget.style.color = '#ef4444'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
      }}
    >
      🗑
    </button>
  )
}
