'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }} className="animate-scalein">
          <div style={{ fontSize: 64, marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>💌</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Check your inbox</h1>
          <p style={{ color: 'var(--muted-fg)', fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--fg)' }}>{email}</strong>. Click the link to activate your account.
          </p>
          <Link href="/login" style={{ color: '#e91e8c', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Back to login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fadeup">
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <Logo size="lg" />
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 28, marginBottom: 8, letterSpacing: '-0.5px' }}>Create your account</h1>
          <p style={{ color: 'var(--muted-fg)', fontSize: 15 }}>Free to start, no credit card needed</p>
        </div>

        <div className="glass mobile-auth-card" style={{ borderRadius: 26, padding: '40px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Email address
              </label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="your@email.com" style={{ padding: '13px 16px', fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Password
              </label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="At least 8 characters" minLength={8} style={{ padding: '13px 16px', fontSize: 15 }} />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: 16, marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                  Creating...
                </span>
              ) : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12, lineHeight: 1.6 }}>
              By signing up you agree to our terms.<br />For adults 18+ only.
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted-fg)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#e91e8c', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
