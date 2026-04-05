'use client'

import { useEffect, useRef, useState } from 'react'

export default function LogoHero({ maxHeight = 860 }: { maxHeight?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const img = new Image()
    img.src = '/heroimage.png'
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      const h = maxHeight
      const w = Math.round(h * ratio)

      setDims({ w, h })

      // Wait for state + canvas to update
      requestAnimationFrame(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)

        const imageData = ctx.getImageData(0, 0, w, h)
        const d = imageData.data
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          const brightness = (r + g + b) / 3
          if (brightness < 20) {
            d[i + 3] = 0
          } else if (brightness < 55) {
            d[i + 3] = Math.round((brightness / 55) * 255)
          }
        }
        ctx.putImageData(imageData, 0, 0)
      })
    }
  }, [maxHeight])

  return (
    <canvas
      ref={canvasRef}
      width={dims.w || 1}
      height={dims.h || 1}
      style={{
        width: dims.w || 0,
        height: dims.h || 0,
        filter: 'drop-shadow(0 0 30px rgba(80,160,255,0.7)) drop-shadow(0 0 70px rgba(100,60,255,0.45)) drop-shadow(0 0 120px rgba(233,30,140,0.25))',
        animation: 'breathe 7s ease-in-out infinite',
        position: 'relative',
        zIndex: 2,
        maxWidth: '100%',
      }}
    />
  )
}
