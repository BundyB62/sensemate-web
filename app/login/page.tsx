'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
      setError('Onjuist e-mailadres of wachtwoord')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }} />
          <h1 className="text-2xl font-bold">Welkom terug</h1>
          <p className="text-gray-400 mt-2 text-sm">Log in op je SenseMate account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
              style={{ background: 'var(--card)', border: '1px solid var(--card-border)', focusRingColor: '#e91e8c' } as React.CSSProperties}
              placeholder="jouw@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
              style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Nog geen account?{' '}
          <Link href="/signup" className="font-medium hover:underline" style={{ color: '#e91e8c' }}>
            Maak er een aan
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Terug naar home</Link>
        </p>
      </div>
    </div>
  )
}
