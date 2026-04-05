'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fadeup">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <Logo size="lg" />
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 28, marginBottom: 8, letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ color: 'var(--muted-fg)', fontSize: 15 }}>Log in to continue</p>
        </div>

        <div className="glass" style={{ borderRadius: 26, padding: '40px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Email address
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{ padding: '13px 16px', fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ padding: '13px 16px', fontSize: 15 }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '14px', fontSize: 16, marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                  Logging in...
                </span>
              ) : 'Log In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted-fg)', fontSize: 14 }}>
          No account yet?{' '}
          <Link href="/signup" style={{ color: '#e91e8c', textDecoration: 'none', fontWeight: 600 }}>
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
