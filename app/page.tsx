import Link from 'next/link'
import Logo from '@/components/Logo'
import LogoHero from '@/components/LogoHero'

import PricingCards from '@/components/PricingCards'
import ChatPreview from '@/components/ChatPreview'
import FeatureCards from '@/components/FeatureCards'
import SideCharacters from '@/components/SideCharacters'


export default function LandingPage() {
  return (
    <div style={{ background: '#07050f', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
      {/* Subtle ambient glows — minimal, elegant */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Soft pink glow — right side */}
        <div style={{
          position: 'absolute', right: '-10%', top: '10%',
          width: '50%', height: '60%',
          background: 'radial-gradient(ellipse at 60% 40%, rgba(233,30,140,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        {/* Soft purple glow — left side */}
        <div style={{
          position: 'absolute', left: '-10%', top: '30%',
          width: '40%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(91,66,243,0.06) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }} />
      </div>

      {/* Nav */}
      <nav className="mobile-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 76,
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
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div className="nav-brand-text" style={{
              fontSize: 42, fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1,
              fontStyle: 'italic',
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(110deg, #ffe0f0 0%, #f472b6 20%, #e91e8c 45%, #be185d 65%, #f9a8d4 85%, #ffe0f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              SenseMates
            </div>
            <div className="mobile-hide" style={{
              fontSize: 9, fontWeight: 300, letterSpacing: '0.38em', textTransform: 'uppercase',
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
        <SideCharacters />

        {/* Hero */}
        <section className="mobile-hero" style={{
          maxWidth: 1240, margin: '0 auto',
          padding: '96px 60px 40px',
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
            <p style={{ fontSize: 15, color: 'rgba(249,168,212,0.55)', marginBottom: 36, lineHeight: 1.7, maxWidth: 400, fontStyle: 'italic' }}>
              No judgement. Full creative freedom — whenever you want it.
            </p>
            <Link href="/signup" className="hero-cta-pulse" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '18px 52px', fontSize: 18, fontWeight: 700, textDecoration: 'none',
              color: '#fff', borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(91,66,243,0.55), rgba(233,30,140,0.55))',
              border: '1px solid rgba(233,30,140,0.5)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 6px 36px rgba(233,30,140,0.35), 0 0 80px rgba(91,66,243,0.15)',
              letterSpacing: '-0.01em',
            }}>
              Meet Your SenseMate →
            </Link>
          </div>

          {/* Right: hero figure */}
          <div className="mobile-hero-figure" style={{ position: 'relative', height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer slow pulse — large blue/purple halo */}
            <div className="hero-glow-outer" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(60,80,220,0.18) 0%, rgba(120,40,200,0.08) 45%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Mid glow — electric blue matching her hair */}
            <div className="hero-glow-mid" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 420, height: 420, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(40,120,255,0.22) 0%, rgba(80,60,240,0.1) 50%, transparent 72%)',
              filter: 'blur(30px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Pink heart glow — lower center */}
            <div className="hero-glow-pink" style={{
              position: 'absolute', top: '62%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(233,30,140,0.35) 0%, rgba(200,20,100,0.1) 50%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Inner bright core — cyan/white */}
            <div className="hero-glow-core" style={{
              position: 'absolute', top: '38%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 150, height: 150, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(120,200,255,0.28) 0%, transparent 65%)',
              filter: 'blur(15px)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            <LogoHero maxHeight={620} />
          </div>
        </section>

        {/* Chat preview */}
        <section className="mobile-section" style={{ padding: '40px 60px 100px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <ChatPreview />
        </section>

        {/* What You Get */}
        <section className="mobile-section" style={{ padding: '60px 60px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <h2 style={{ fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', margin: 0 }}>
              What You Get
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <FeatureCards />
        </section>

        {/* Pricing */}
        <section className="mobile-section" style={{ padding: '20px 60px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <h2 style={{ fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', margin: 0 }}>
              Choose Your Plan
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <PricingCards />
        </section>

        {/* Comparison table */}
        <section className="mobile-section" style={{ padding: '0 60px 120px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,8,20,0.8)', backdropFilter: 'blur(20px)' }}>
            {/* Table header */}
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Compare plans</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>See exactly what you get with each plan</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Free</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', color: '#a78bfa', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, background: 'rgba(91,66,243,0.05)' }}>Pro</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, background: 'rgba(245,158,11,0.05)', color: '#f59e0b' }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Companions', free: '1', pro: '3', premium: '∞' },
                  { feature: 'Messages per day', free: '100', pro: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'Photos per day', free: '5', pro: '50', premium: 'Unlimited' },
                  { feature: 'Roleplay scenarios', free: '3', pro: '12', premium: '12' },
                  { feature: 'Photo quality', free: 'Standard', pro: 'HD', premium: 'HD + Priority' },
                  { feature: 'Conversation memory', free: 'Last 20 msgs', pro: 'Full history', premium: 'Full history' },
                  { feature: 'Mature content', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Custom scenarios', free: '—', pro: '—', premium: '✓' },
                  { feature: 'Priority support', free: '—', pro: '—', premium: '✓' },
                ].map((row, i, arr) => (
                  <tr key={row.feature} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '14px 24px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: 13 }}>{row.feature}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{row.free}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: row.pro === '✓' || row.pro === 'Unlimited' ? 600 : 400, color: row.pro === '✓' || row.pro === 'Unlimited' || row.pro === '12' || row.pro === 'HD' || row.pro === 'Full history' ? '#a78bfa' : 'rgba(255,255,255,0.3)', background: 'rgba(91,66,243,0.03)' }}>{row.pro}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: row.premium === '✓' || row.premium === 'Unlimited' ? 600 : 400, color: row.premium === '✓' || row.premium === 'Unlimited' || row.premium === '12' || row.premium === 'HD + Priority' || row.premium === 'Full history' || row.premium === '∞' ? '#f59e0b' : 'rgba(255,255,255,0.3)', background: 'rgba(245,158,11,0.03)' }}>{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mobile-footer" style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© 2026 SenseMates · 18+ only · All rights reserved</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 13 }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 13 }}>Terms</Link>
            <Link href="mailto:support@sensemates.com" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 13 }}>Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
