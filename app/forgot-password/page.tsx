'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fadeup">
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <Logo size="lg" />
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 28, marginBottom: 8, letterSpacing: '-0.5px' }}>
            {sent ? 'Check your email' : 'Reset password'}
          </h1>
          <p style={{ color: 'var(--muted-fg)', fontSize: 15 }}>
            {sent
              ? 'We sent a reset link to your email address.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </p>
        </div>

        <div className="glass mobile-auth-card" style={{ borderRadius: 26, padding: '40px' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <p style={{ color: 'var(--muted-fg)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                If an account exists for <strong style={{ color: 'var(--fg)' }}>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="btn-primary"
                style={{ display: 'block', padding: '14px', fontSize: 16, textAlign: 'center', textDecoration: 'none' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                  autoFocus
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                    Sending...
                  </span>
                ) : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted-fg)', fontSize: 14 }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: '#e91e8c', textDecoration: 'none', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
