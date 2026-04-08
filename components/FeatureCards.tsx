'use client'
import { useState } from 'react'

const FEATURES = [
  { icon: '🎨', title: 'Full Character Creator', desc: 'Design every detail — ethnicity, body type, hair, eyes, clothing. Over 6,000 combinations.', accent: '233,30,140' },
  { icon: '📸', title: 'AI Photo Generation', desc: 'Request photos in any pose, outfit, or scenario. Generated in seconds with your character.', accent: '168,85,247' },
  { icon: '🎭', title: '12 Roleplay Scenarios', desc: 'Hotel maid, nurse, secretary, police officer — one click to start a fantasy.', accent: '244,63,94' },
  { icon: '💬', title: 'Natural Conversations', desc: 'Chat in any language. The AI remembers your name, preferences, and conversation history.', accent: '91,66,243' },
  { icon: '🔞', title: 'No Content Limits', desc: 'Full mature content. No filters, no judgment. Everything is between you and your companion.', accent: '249,115,22' },
  { icon: '🔒', title: 'Private & Encrypted', desc: 'Your conversations are yours. No data sharing, no tracking, no ads. Ever.', accent: '34,197,94' },
]

function FeatureCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px 24px', borderRadius: 20,
        background: hovered
          ? `linear-gradient(145deg, rgba(${accent},0.12), rgba(${accent},0.04))`
          : 'rgba(12,10,24,0.85)',
        border: hovered
          ? `1px solid rgba(${accent},0.3)`
          : '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
        transform: hovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 16px 48px rgba(${accent},0.2), 0 0 40px rgba(${accent},0.08)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, transparent 25%, rgba(${accent},0.06) 50%, transparent 75%)`,
        transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* Glow dot behind icon */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accent},${hovered ? 0.15 : 0}) 0%, transparent 70%)`,
        transition: 'all 0.4s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ fontSize: 36, marginBottom: 16, position: 'relative' }}>{icon}</div>
      <div style={{
        fontSize: 16, fontWeight: 700, marginBottom: 8, position: 'relative',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
      }}>{title}</div>
      <div style={{
        fontSize: 13, lineHeight: 1.6, position: 'relative',
        color: hovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)',
        transition: 'color 0.3s ease',
      }}>{desc}</div>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }} className="mobile-pricing-grid">
      {FEATURES.map(f => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  )
}
