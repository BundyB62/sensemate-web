'use client'
import { useState } from 'react'

const DYNAMICS = [
  {
    name: 'Mind',
    desc: 'Insight & Intelligence',
    icon: '/icon-mind.png',
    rgb: '80,120,255',
  },
  {
    name: 'Soul',
    desc: 'Comfort & Connection',
    icon: '/icon-soul.png',
    rgb: '200,60,220',
  },
  {
    name: 'Desire',
    desc: 'Passion & Intimacy',
    icon: '/icon-desire.png',
    rgb: '255,80,40',
  },
  {
    name: 'Drive',
    desc: 'Motivation & Focus',
    icon: '/icon-drive.png',
    rgb: '0,210,220',
  },
]

function Particles({ rgb, active }: { rgb: string; active: boolean }) {
  const dots = [
    { x: '10%', y: '15%', size: 3, delay: 0 },
    { x: '85%', y: '10%', size: 2, delay: 0.2 },
    { x: '75%', y: '80%', size: 3, delay: 0.5 },
    { x: '15%', y: '78%', size: 2, delay: 0.8 },
    { x: '50%', y: '6%',  size: 2, delay: 0.15 },
    { x: '92%', y: '45%', size: 3, delay: 0.4 },
    { x: '5%',  y: '48%', size: 2, delay: 0.7 },
    { x: '55%', y: '93%', size: 2, delay: 0.3 },
    { x: '30%', y: '5%',  size: 2, delay: 0.6 },
    { x: '88%', y: '70%', size: 2, delay: 0.9 },
  ]
  return (
    <>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x, top: d.y,
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: `rgba(${rgb},1)`,
          boxShadow: `0 0 ${d.size * 4}px rgba(${rgb},1), 0 0 ${d.size * 8}px rgba(${rgb},0.6)`,
          opacity: active ? 1 : 0,
          transform: active ? 'scale(1)' : 'scale(0)',
          transition: `opacity 0.5s ease ${d.delay}s, transform 0.5s cubic-bezier(0.34,1.4,0.64,1) ${d.delay}s`,
          pointerEvents: 'none',
          zIndex: 3,
        }} />
      ))}
    </>
  )
}

function DynamicCard({ d }: { d: typeof DYNAMICS[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-10px) scale(1.04)' : 'translateY(0) scale(1)',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)',
        // Edge light — the glowing border
        boxShadow: hovered
          ? `0 0 0 1.5px rgba(${d.rgb},0.9), 0 0 20px rgba(${d.rgb},0.7), 0 0 50px rgba(${d.rgb},0.4), 0 0 100px rgba(${d.rgb},0.2), 0 30px 60px rgba(0,0,0,0.6)`
          : `0 0 0 1px rgba(${d.rgb},0.2), 0 0 12px rgba(${d.rgb},0.1), 0 12px 40px rgba(0,0,0,0.5)`,
      }}
    >
      {/* The image IS the card */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={d.icon}
        alt={d.name}
        style={{
          width: '100%',
          display: 'block',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)',
          filter: hovered
            ? `brightness(1.15) saturate(1.3) drop-shadow(0 0 20px rgba(${d.rgb},0.6))`
            : 'brightness(1) saturate(1)',
        }}
      />

      {/* Edge light overlay — inner rim glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        boxShadow: hovered
          ? `inset 0 0 30px rgba(${d.rgb},0.25), inset 0 0 2px rgba(${d.rgb},0.8)`
          : `inset 0 0 0px rgba(${d.rgb},0)`,
        transition: 'box-shadow 0.4s ease',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, transparent 20%, rgba(${d.rgb},0.12) 50%, transparent 80%)`,
        transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.6s ease',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Particles */}
      <Particles rgb={d.rgb} active={hovered} />

    </div>
  )
}

export default function DynamicCards() {
  return (
    <div className="mobile-dynamic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {DYNAMICS.map(d => <DynamicCard key={d.name} d={d} />)}
    </div>
  )
}
