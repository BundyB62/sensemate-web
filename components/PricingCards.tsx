'use client'
import { useState } from 'react'
import Link from 'next/link'

function PriceCard({ children, hoverShadow, hoverBorder, defaultBorder, defaultBg, hoverBg, shimmerColor = 'rgba(255,255,255,0.07)', scale = 1.02 }: {
  children: React.ReactNode
  hoverShadow: string
  hoverBorder: string
  defaultBorder: string
  defaultBg: string
  hoverBg: string
  shimmerColor?: string
  scale?: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 22, padding: '44px 36px', position: 'relative', overflow: 'hidden',
        background: hovered ? hoverBg : defaultBg,
        border: hovered ? hoverBorder : defaultBorder,
        backdropFilter: 'blur(24px)',
        boxShadow: hovered ? hoverShadow : '0 4px 24px rgba(0,0,0,0.3)',
        transform: hovered ? `translateY(-10px) scale(${scale})` : 'translateY(0) scale(1)',
        transition: 'all 0.32s cubic-bezier(0.34, 1.2, 0.64, 1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
        transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.6s ease',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}

export default function PricingCards() {
  return (
    <div className="mobile-pricing-grid" style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>

      {/* Free — muted, smaller, less prominent */}
      <PriceCard
        defaultBg="rgba(255,255,255,0.015)"
        hoverBg="rgba(255,255,255,0.03)"
        defaultBorder="1px solid rgba(255,255,255,0.05)"
        hoverBorder="1px solid rgba(255,255,255,0.12)"
        hoverShadow="0 8px 30px rgba(0,0,0,0.4)"
        scale={1.01}
      >
        {/* Faded "basic" label */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>
          Basic
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.55)' }}>Free</h3>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>$0<span style={{ fontSize: 14, fontWeight: 500 }}>/month</span></div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Get a taste of what SenseMates can be</p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 32 }}>
          {[
            '1 companion',
            '100 messages / day',
            '5 photos / day',
            '3 roleplay scenarios',
          ].map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>–</span>{f}
            </li>
          ))}
        </ul>

        <Link href="/signup" style={{
          display: 'block', textAlign: 'center', padding: '11px 24px', borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
          marginTop: 'auto',
        }}>Get Started</Link>
      </PriceCard>

      {/* Pro — vibrant, slightly taller */}
      <PriceCard
        defaultBg="linear-gradient(145deg, rgba(60,30,160,0.35), rgba(140,30,100,0.22))"
        hoverBg="linear-gradient(145deg, rgba(80,40,200,0.5), rgba(180,30,120,0.32))"
        defaultBorder="1px solid rgba(130,80,255,0.35)"
        hoverBorder="1px solid rgba(160,100,255,0.8)"
        hoverShadow="0 0 0 1px rgba(150,100,255,0.4), 0 12px 50px rgba(91,66,243,0.5), 0 24px 80px rgba(233,30,140,0.3), 0 40px 100px rgba(0,0,0,0.5)"
        shimmerColor="rgba(180,120,255,0.1)"
      >
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(180,150,255,0.7)', marginBottom: 12 }}>
          Most Popular
        </div>
        <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#fff', letterSpacing: '-0.5px' }}>Pro</h3>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>$9.99<span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(190,160,255,0.7)' }}>/month</span></div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(190,160,255,0.8)', marginBottom: 24 }}>Deeper Connection</p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 36 }}>
          {[
            'Up to 3 companions',
            'Unlimited messages',
            '50 HD photos / day',
            'All 12 scenarios',
            'Full conversation memory',
            'Mature content',
          ].map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ color: '#e91e8c', fontWeight: 700, fontSize: 12 }}>✓</span>{f}
            </li>
          ))}
        </ul>

        <Link href="/signup" style={{
          display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: 100,
          background: 'linear-gradient(135deg, #5b42f3, #e91e8c)',
          color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700,
          boxShadow: '0 4px 30px rgba(91,66,243,0.5), 0 0 60px rgba(233,30,140,0.2)',
          letterSpacing: '0.01em', marginTop: 'auto',
        }}>Upgrade Now</Link>
      </PriceCard>

      {/* Premium — royaal, sensual, uitblinker */}
      <PriceCard
        defaultBg="linear-gradient(160deg, rgba(140,70,5,0.45) 0%, rgba(80,30,0,0.35) 50%, rgba(180,100,10,0.25) 100%)"
        hoverBg="linear-gradient(160deg, rgba(180,90,5,0.6) 0%, rgba(100,40,0,0.45) 50%, rgba(220,130,10,0.35) 100%)"
        defaultBorder="1px solid rgba(220,150,30,0.5)"
        hoverBorder="1px solid rgba(255,200,60,0.9)"
        hoverShadow="0 0 0 1px rgba(255,190,40,0.6), 0 0 30px rgba(240,160,20,0.4), 0 12px 60px rgba(220,120,10,0.6), 0 24px 100px rgba(245,158,11,0.35), 0 50px 120px rgba(0,0,0,0.6)"
        shimmerColor="rgba(255,210,80,0.14)"
        scale={1.03}
      >
        {/* Ambient top glow */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 80,
          background: 'radial-gradient(ellipse, rgba(255,180,30,0.3) 0%, transparent 70%)',
          filter: 'blur(20px)', pointerEvents: 'none',
        }} />

        {/* Crown + label */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,210,80,0.9)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>♛</span> Ultimate Experience
        </div>

        <h3 style={{
          fontSize: 34, fontWeight: 900, marginBottom: 4, letterSpacing: '-1px', lineHeight: 1,
          background: 'linear-gradient(135deg, #ffe0a0 0%, #f59e0b 40%, #e07b00 70%, #ffd080 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Premium</h3>

        <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 4 }}>
          <span style={{ background: 'linear-gradient(135deg, #ffe0a0, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$24.99</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,200,100,0.5)' }}>/month</span>
        </div>

        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,200,100,0.65)', marginBottom: 28, letterSpacing: '0.02em' }}>
          For those who want it all
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 36 }}>
          {[
            { text: 'Unlimited companions', highlight: true },
            { text: 'Everything in Pro', highlight: false },
            { text: 'Unlimited HD photos', highlight: true },
            { text: 'Priority generation speed', highlight: false },
            { text: 'Custom scenarios', highlight: true },
            { text: 'Priority support', highlight: false },
          ].map(f => (
            <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: f.highlight ? 'rgba(255,220,120,0.95)' : 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 13, filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.8))' }}>✦</span>
              {f.text}
            </li>
          ))}
        </ul>

        <Link href="/signup" style={{
          display: 'block', textAlign: 'center', padding: '15px 24px', borderRadius: 100,
          background: 'linear-gradient(135deg, #c8720a 0%, #f59e0b 45%, #ffd060 75%, #f0a500 100%)',
          color: '#1a0800', textDecoration: 'none', fontSize: 15, fontWeight: 800,
          boxShadow: '0 4px 30px rgba(220,130,10,0.65), 0 0 80px rgba(245,158,11,0.3)',
          letterSpacing: '0.03em', textTransform: 'uppercase', marginTop: 'auto',
        }}>Go Premium</Link>
      </PriceCard>

    </div>
  )
}
