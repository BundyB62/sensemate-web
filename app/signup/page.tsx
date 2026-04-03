'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-2">Check je e-mail!</h2>
          <p className="text-gray-400">We hebben een bevestigingslink gestuurd naar <strong className="text-white">{email}</strong>. Klik op de link om je account te activeren.</p>
          <Link href="/login" className="mt-6 inline-block text-sm" style={{ color: '#e91e8c' }}>Terug naar inloggen</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }} />
          <h1 className="text-2xl font-bold">Maak je account aan</h1>
          <p className="text-gray-400 mt-2 text-sm">Gratis starten, geen creditcard nodig</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
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
              minLength={8}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
              placeholder="Minimaal 8 tekens"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500">Door je aan te melden ga je akkoord met onze voorwaarden. SenseMate is alleen voor personen van 18 jaar en ouder.</p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}
          >
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Al een account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#e91e8c' }}>
            Inloggen
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">← Terug naar home</Link>
        </p>
      </div>
    </div>
  )
}
