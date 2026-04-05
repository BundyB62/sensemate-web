'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AddCompanionCard() {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href="/onboarding" style={{ textDecoration: 'none' }}>
      <div
        style={{
          borderRadius: 24, padding: '24px',
          border: `2px dashed ${hovered ? 'rgba(233,30,140,0.4)' : 'var(--card-border)'}`,
          background: hovered ? 'rgba(233,30,140,0.04)' : 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, cursor: 'pointer', minHeight: 200, transition: 'all 0.25s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: 'rgba(233,30,140,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          border: '1px solid rgba(233,30,140,0.2)',
        }}>+</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-fg)' }}>Nieuwe companion</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>Kies prebuilt of maak je eigen</div>
      </div>
    </Link>
  )
}
