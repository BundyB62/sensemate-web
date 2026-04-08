import Link from 'next/link'
import Logo from '@/components/Logo'
import LogoHero from '@/components/LogoHero'
import DynamicCards from '@/components/DynamicCards'
import PricingCards from '@/components/PricingCards'
import ChatPreview from '@/components/ChatPreview'

const DYNAMICS = [
  {
    name: 'Advisor', desc: 'Guidance & Insight',
    rgb: '80,120,255',
    border: 'rgba(80,120,255,0.2)',
    bg: 'linear-gradient(160deg, rgba(30,50,160,0.22) 0%, rgba(10,10,40,0.04) 100%)',
    svgColor: 'rgba(110,155,255,0.95)',
    svg: `<circle cx="16" cy="13" r="6" stroke-width="1.4"/>
          <path d="M10 19 Q16 24 22 19" stroke-width="1.4"/>
          <path d="M13 23 L13 28 M19 23 L19 28 M11 28 L21 28" stroke-width="1.3"/>
          <circle cx="16" cy="9" r="1.2" fill="currentColor" stroke="none"/>`,
    vb: '0 0 32 32',
  },
  {
    name: 'Companion', desc: 'Comfort & Connection',
    rgb: '233,60,160',
    border: 'rgba(233,60,160,0.2)',
    bg: 'linear-gradient(160deg, rgba(140,20,90,0.22) 0%, rgba(50,5,30,0.04) 100%)',
    svgColor: 'rgba(250,90,185,0.95)',
    svg: `<path d="M16 26 C16 26 5 19 5 12A6 6 0 0 1 16 9.5A6 6 0 0 1 27 12C27 19 16 26 16 26Z" stroke-width="1.4"/>`,
    vb: '0 0 32 32',
  },
  {
    name: 'Lover', desc: 'Passion & Desire',
    rgb: '255,80,60',
    border: 'rgba(255,80,60,0.2)',
    bg: 'linear-gradient(160deg, rgba(160,30,15,0.22) 0%, rgba(50,8,5,0.04) 100%)',
    svgColor: 'rgba(255,110,80,0.95)',
    svg: `<path d="M16 27 C15 23 8 18 8 12.5A5.5 5.5 0 0 1 16 8A5.5 5.5 0 0 1 24 12.5C24 18 17 23 16 27Z" stroke-width="1.4"/>
          <path d="M16 8 C16 6 14.5 4 16 3C17.5 4 16 6 16 8" stroke-width="1.2" opacity="0.7"/>`,
    vb: '0 0 32 32',
  },
  {
    name: 'Coach', desc: 'Motivation & Focus',
    rgb: '20,210,170',
    border: 'rgba(20,210,170,0.2)',
    bg: 'linear-gradient(160deg, rgba(8,110,90,0.22) 0%, rgba(3,35,30,0.04) 100%)',
    svgColor: 'rgba(40,230,185,0.95)',
    svg: `<circle cx="16" cy="16" r="11" stroke-width="1.4"/>
          <circle cx="16" cy="16" r="7" stroke-width="1.3"/>
          <circle cx="16" cy="16" r="3" stroke-width="1.2"/>
          <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/>`,
    vb: '0 0 32 32',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#07050f', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
      {/* Fixed atmospheric warm glow layers */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Main warm amber glow - right side where hero figure is */}
        <div style={{
          position: 'absolute', right: '-5%', top: '0',
          width: '60%', height: '100vh',
          background: 'radial-gradient(ellipse at 65% 40%, rgba(180,100,20,0.2) 0%, rgba(140,70,10,0.08) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        {/* Secondary amber bloom lower */}
        <div style={{
          position: 'absolute', right: '15%', top: '30%',
          width: '35%', height: '70%',
          background: 'radial-gradient(ellipse, rgba(200,120,30,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        {/* Deep purple ambient left */}
        <div style={{
          position: 'absolute', left: '-5%', top: '20%',
          width: '40%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(60,20,120,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Nav */}
      <nav className="mobile-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 110,
        background: 'rgba(6,4,14,0.88)',
        borderBottom: '1px solid rgba(233,30,140,0.12)',
        backdropFilter: 'blur(36px)',
        overflow: 'hidden',
      }}>
        {/* Ambient glow behind brand */}
        <div className="mobile-hide" style={{
          position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)',
          width: 420, height: 180,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(233,30,140,0.14) 0%, rgba(91,66,243,0.08) 50%, transparent 75%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        {/* Bottom glow line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(233,30,140,0.35) 30%, rgba(91,66,243,0.35) 70%, transparent 100%)',
        }} />

        <div className="mobile-nav-inner" style={{
          height: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', padding: '0 52px',
        }}>
          {/* Left — empty spacer */}
          <div className="mobile-hide" />

          {/* Center — Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div className="nav-brand-text" style={{
              fontSize: 58, fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1,
              fontStyle: 'italic',
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(110deg, #ffe0f0 0%, #f472b6 20%, #e91e8c 45%, #be185d 65%, #f9a8d4 85%, #ffe0f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              SenseMates
            </div>
            <div className="mobile-hide" style={{
              fontSize: 10, fontWeight: 300, letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(249,168,212,0.35)', fontStyle: 'normal',
            }}>
              feel the connection
            </div>
          </Link>

          {/* Right — Nav actions */}
          <div className="mobile-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/login" className="mobile-hide" style={{
              color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 20px',
              letterSpacing: '0.02em',
            }}>
              Log In
            </Link>
            <Link href="/signup" className="mobile-nav-cta" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '11px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              color: '#fff', borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(91,66,243,0.6), rgba(233,30,140,0.6))',
              border: '1px solid rgba(233,30,140,0.35)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(233,30,140,0.2)',
              letterSpacing: '0.01em',
            }}>
              Create Your SenseMate
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <section className="mobile-hero" style={{
          minHeight: '100vh', maxWidth: 1240, margin: '0 auto',
          padding: '130px 60px 60px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          alignItems: 'center', gap: 40,
        }}>
          {/* Left: text */}
          <div style={{ position: 'relative', zIndex: 5 }}>
            <h1 className="mobile-hero-title" style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 28, color: '#fff' }}>
              Your AI companion.<br />
              <span style={{
                background: 'linear-gradient(110deg, #f9a8d4 0%, #e91e8c 50%, #be185d 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Designed for adults.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', marginBottom: 16, lineHeight: 1.8, maxWidth: 440 }}>
              Create your perfect companion — choose their look, personality, and style.
              Chat, roleplay, and receive AI-generated photos.
            </p>
            <p style={{ fontSize: 15, color: 'rgba(249,168,212,0.55)', marginBottom: 52, lineHeight: 1.7, maxWidth: 400, fontStyle: 'italic' }}>
              No judgement. Full creative freedom — whenever you want it.
            </p>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 40px', fontSize: 16, fontWeight: 600, textDecoration: 'none',
              color: '#fff', borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(91,66,243,0.55), rgba(233,30,140,0.55))',
              border: '1px solid rgba(233,30,140,0.35)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 28px rgba(233,30,140,0.25)',
            }}>
              Meet Your SenseMate →
            </Link>
          </div>

          {/* Right: hero figure */}
          <div className="mobile-hero-figure" style={{ position: 'relative', height: 860, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer slow pulse — large blue/purple halo */}
            <div className="hero-glow-outer" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 820, height: 820, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(60,80,220,0.18) 0%, rgba(120,40,200,0.08) 45%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Mid glow — electric blue matching her hair */}
            <div className="hero-glow-mid" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 580, height: 580, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(40,120,255,0.22) 0%, rgba(80,60,240,0.1) 50%, transparent 72%)',
              filter: 'blur(30px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Pink heart glow — lower center */}
            <div className="hero-glow-pink" style={{
              position: 'absolute', top: '62%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(233,30,140,0.35) 0%, rgba(200,20,100,0.1) 50%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Inner bright core — cyan/white */}
            <div className="hero-glow-core" style={{
              position: 'absolute', top: '38%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(120,200,255,0.28) 0%, transparent 65%)',
              filter: 'blur(15px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            <LogoHero maxHeight={860} />
          </div>
        </section>

        {/* Chat preview */}
        <section className="mobile-section" style={{ padding: '20px 60px 80px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <ChatPreview />
        </section>

        {/* Choose Your Dynamic */}
        <section className="mobile-section" style={{ padding: '60px 60px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 48 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', margin: 0 }}>
              Choose Your Dynamic
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <DynamicCards />
        </section>

        {/* It Evolves With You */}
        <section className="mobile-section" style={{ padding: '40px 60px 80px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <h2 style={{ fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', margin: 0 }}>
              It Evolves With You
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 17, lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
            Learns your memories. Adapts to who you are. Grows closer every day.
          </p>
        </section>

        {/* Pricing — 3 plans */}
        <section className="mobile-section" style={{ padding: '20px 60px 120px' }}>
          <PricingCards />
        </section>

        {/* Footer */}
        <footer className="mobile-footer" style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© 2026 SenseMates · 18+ only · All rights reserved</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} href="/" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 13 }}>{l}</Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
