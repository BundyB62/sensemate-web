'use client'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const SIZES = {
  sm:  { img: 28, fontSize: 16, gap: 8, letterSpacing: '-0.3px' },
  md:  { img: 36, fontSize: 20, gap: 10, letterSpacing: '-0.5px' },
  lg:  { img: 52, fontSize: 28, gap: 14, letterSpacing: '-0.8px' },
  xl:  { img: 80, fontSize: 42, gap: 18, letterSpacing: '-1.5px' },
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = SIZES[size]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      {/* Logo image */}
      <div style={{
        width: s.img, height: s.img, borderRadius: '22%',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: `0 0 ${s.img * 0.5}px rgba(100,120,255,0.45), 0 0 ${s.img * 0.25}px rgba(233,30,140,0.3)`,
        transition: 'box-shadow 0.3s ease',
      }}>
        <img
          src="/logo.png"
          alt="SenseMate logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Text */}
      {showText && (
        <span style={{
          fontSize: s.fontSize,
          fontWeight: 900,
          letterSpacing: s.letterSpacing,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #c8b8ff 0%, #e91e8c 45%, #ff8fa3 80%, #ffd6e7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        }}>
          SenseMate
        </span>
      )}
    </div>
  )
}
