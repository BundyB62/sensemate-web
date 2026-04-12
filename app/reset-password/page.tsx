'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Supabase sends the user here with a hash fragment containing the access token
  // The client library picks it up automatically from the URL
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via reset link — they can now set a new password
      }
    })
  }, [supabase.auth])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/dashboard'), 2000)
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
            {success ? 'Password updated!' : 'Set new password'}
          </h1>
          <p style={{ color: 'var(--muted-fg)', fontSize: 15 }}>
            {success ? 'Redirecting to your dashboard...' : 'Choose a new password for your account.'}
          </p>
        </div>

        <div className="glass mobile-auth-card" style={{ borderRadius: 26, padding: '40px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ color: 'var(--muted-fg)', fontSize: 14, lineHeight: 1.7 }}>
                Your password has been updated. You will be redirected shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                  New password
                </label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoFocus
                  minLength={6}
                  style={{ padding: '13px 16px', fontSize: 15 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Confirm password
                </label>
                <input
                  className="input"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
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
                    Updating...
                  </span>
                ) : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
