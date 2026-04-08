'use client'

// Decorative character images flanking the landing page content
// PNG images have transparent backgrounds (AI background removal)
// CSS animations create a living, breathing, seductive effect

const LEFT_CHARS = [
  { img: '/side-woman-1.png', top: '3%', anim: 'sway-a', dur: '6s' },
  { img: '/side-woman-3.png', top: '36%', anim: 'sway-b', dur: '7s' },
  { img: '/side-woman-5.png', top: '69%', anim: 'sway-c', dur: '5.5s' },
]

const RIGHT_CHARS = [
  { img: '/side-woman-2.png', top: '10%', anim: 'sway-b', dur: '6.5s' },
  { img: '/side-woman-4.png', top: '43%', anim: 'sway-c', dur: '5s' },
  { img: '/side-woman-6.png', top: '76%', anim: 'sway-a', dur: '7.5s' },
]

function SideChar({ src, side, top, anim, dur }: {
  src: string; side: 'left' | 'right'; top: string; anim: string; dur: string
}) {
  const isLeft = side === 'left'

  return (
    <div style={{
      position: 'absolute',
      [side]: 0,
      top,
      width: 280,
      opacity: 0.9,
      animation: `${anim} ${dur} ease-in-out infinite`,
      maskImage: `linear-gradient(to ${isLeft ? 'right' : 'left'}, black 0%, black 60%, transparent 100%)`,
      WebkitMaskImage: `linear-gradient(to ${isLeft ? 'right' : 'left'}, black 0%, black 60%, transparent 100%)`,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

export default function SideCharacters() {
  return (
    <div className="side-characters-wrapper" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes sway-a {
          0%, 100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          20%      { transform: translateY(-8px) translateX(3px) scale(1.02) rotate(0.3deg); }
          40%      { transform: translateY(-14px) translateX(-2px) scale(1.01) rotate(-0.2deg); }
          60%      { transform: translateY(-6px) translateX(4px) scale(1.025) rotate(0.2deg); }
          80%      { transform: translateY(-12px) translateX(-1px) scale(1.015) rotate(-0.3deg); }
        }
        @keyframes sway-b {
          0%, 100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          15%      { transform: translateY(-10px) translateX(-3px) scale(1.015) rotate(-0.4deg); }
          35%      { transform: translateY(-4px) translateX(4px) scale(1.03) rotate(0.3deg); }
          55%      { transform: translateY(-16px) translateX(-2px) scale(1.01) rotate(-0.2deg); }
          75%      { transform: translateY(-8px) translateX(3px) scale(1.02) rotate(0.4deg); }
        }
        @keyframes sway-c {
          0%, 100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          25%      { transform: translateY(-12px) translateX(2px) scale(1.025) rotate(0.3deg); }
          50%      { transform: translateY(-6px) translateX(-4px) scale(1.01) rotate(-0.4deg); }
          75%      { transform: translateY(-15px) translateX(3px) scale(1.02) rotate(0.2deg); }
        }
      `}</style>

      {LEFT_CHARS.map((c, i) => (
        <SideChar key={`l${i}`} src={c.img} side="left" top={c.top} anim={c.anim} dur={c.dur} />
      ))}
      {RIGHT_CHARS.map((c, i) => (
        <SideChar key={`r${i}`} src={c.img} side="right" top={c.top} anim={c.anim} dur={c.dur} />
      ))}
    </div>
  )
}
