'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  baseOpacity: number
  speedX: number
  speedY: number
  phase: number
  pulseSpeed: number   // individual shine speed
  pulseDepth: number   // how dramatic the twinkle is
  type: 'gold' | 'amber' | 'white'
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 78
    const types: Particle['type'][] = [
      'gold', 'gold', 'gold', 'gold', 'gold', 'gold', 'gold',
      'amber', 'amber',
      'white',
    ]
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3.5 + 1.2,
      baseOpacity: Math.random() * 0.5 + 0.45,
      speedX: (Math.random() - 0.5) * 0.45,
      speedY: (Math.random() - 0.5) * 0.45,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 2.5 + 0.6,
      pulseDepth: Math.random() * 0.7 + 0.3,
      type: types[Math.floor(Math.random() * types.length)],
    }))

    const COLORS: Record<Particle['type'], [number, number, number]> = {
      gold:  [220, 170, 50],
      amber: [200, 130, 30],
      white: [255, 240, 190],
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.007

      for (const p of particles) {
        // gentle sine drift so they float naturally instead of moving in straight lines
        p.x += p.speedX + Math.sin(t * 0.6 + p.phase) * 0.18
        p.y += p.speedY + Math.cos(t * 0.5 + p.phase * 1.3) * 0.18
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Each particle pulses at its own speed and depth
        const pulse = Math.sin(t * p.pulseSpeed + p.phase)
        // Map from [-1,1] → opacity range, using pulseDepth for drama
        const alpha = p.baseOpacity * (1 - p.pulseDepth * 0.5 + pulse * p.pulseDepth * 0.5)
        const [r, g, b] = COLORS[p.type]

        // When near peak brightness, add a quick "pop" — extra size
        const brightnessPop = Math.max(0, pulse) * p.pulseDepth
        const renderSize = p.size * (1 + brightnessPop * 0.45)

        ctx.beginPath()
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        // Glow halo — scales with brightness
        if (p.size > 1.2) {
          const haloSize = renderSize * (4 + brightnessPop * 3)
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloSize)
          grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.7})`)
          grd.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath()
          ctx.arc(p.x, p.y, haloSize, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
