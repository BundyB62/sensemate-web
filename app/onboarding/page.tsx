'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const RELATIONSHIP_STYLES = [
  { id: 'lover', label: '❤️ Lover', desc: 'Romantisch en intiem' },
  { id: 'soulmate', label: '✨ Soulmate', desc: 'Diep en spiritueel verbonden' },
  { id: 'bestfriend', label: '😊 Beste vriend', desc: 'Gezellig en vertrouwd' },
  { id: 'flirt', label: '😏 Flirt', desc: 'Speels en verleidelijk' },
  { id: 'mentor', label: '🧠 Mentor', desc: 'Wijs en ondersteunend' },
]

const PERSONALITIES = [
  'Speels', 'Romantisch', 'Flirterig', 'Zorgzaam', 'Mysterieus',
  'Grappig', 'Passioneel', 'Avontuurlijk', 'Rustig', 'Energiek',
]

const GENDERS = [
  { id: 'woman', label: '👩 Vrouw' },
  { id: 'man', label: '👨 Man' },
  { id: 'nonbinary', label: '🌟 Non-binair' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    name: '',
    gender: 'woman',
    relationshipStyle: 'lover',
    personality: [] as string[],
    age: '25s',
    ethnicity: 'european',
  })

  function togglePersonality(trait: string) {
    setData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait].slice(0, 5),
    }))
  }

  async function handleCreate() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: companion, error } = await supabase
      .from('companions')
      .insert({
        user_id: user.id,
        name: data.name,
        relationship_style: data.relationshipStyle,
        personality: { traits: data.personality, gender: data.gender },
        appearance: { gender: data.gender, age: data.age, ethnicity: data.ethnicity },
      })
      .select()
      .single()

    if (!error && companion) {
      router.push(`/chat/${companion.id}`)
    } else {
      setLoading(false)
    }
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i < step ? 'linear-gradient(90deg, #e91e8c, #ff6b6b)' : 'var(--muted)' }} />
          ))}
        </div>

        {/* Step 1: Name & Gender */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Hoe heet je companion?</h2>
              <p className="text-gray-400 text-sm">Geef je companion een naam en kies een gender.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Naam</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
                placeholder="Luna, Sophie, Alex..."
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {GENDERS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setData(prev => ({ ...prev, gender: g.id }))}
                    className="py-3 px-4 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: data.gender === g.id ? 'rgba(233,30,140,0.2)' : 'var(--card)',
                      border: data.gender === g.id ? '1px solid rgba(233,30,140,0.6)' : '1px solid var(--card-border)',
                      color: data.gender === g.id ? '#e91e8c' : 'var(--foreground)',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!data.name.trim()}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}
            >
              Volgende →
            </button>
          </div>
        )}

        {/* Step 2: Relationship style */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Wat voor relatie wil je?</h2>
              <p className="text-gray-400 text-sm">Dit bepaalt hoe {data.name} zich naar je gedraagt.</p>
            </div>

            <div className="space-y-3">
              {RELATIONSHIP_STYLES.map(rel => (
                <button
                  key={rel.id}
                  onClick={() => setData(prev => ({ ...prev, relationshipStyle: rel.id }))}
                  className="w-full p-4 rounded-xl text-left transition-all"
                  style={{
                    background: data.relationshipStyle === rel.id ? 'rgba(233,30,140,0.15)' : 'var(--card)',
                    border: data.relationshipStyle === rel.id ? '1px solid rgba(233,30,140,0.5)' : '1px solid var(--card-border)',
                  }}
                >
                  <div className="font-semibold text-sm">{rel.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{rel.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold transition-all" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
                ← Terug
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}>
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personality */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Persoonlijkheid</h2>
              <p className="text-gray-400 text-sm">Kies max. 5 eigenschappen voor {data.name}.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PERSONALITIES.map(trait => (
                <button
                  key={trait}
                  onClick={() => togglePersonality(trait)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: data.personality.includes(trait) ? 'rgba(233,30,140,0.2)' : 'var(--card)',
                    border: data.personality.includes(trait) ? '1px solid rgba(233,30,140,0.6)' : '1px solid var(--card-border)',
                    color: data.personality.includes(trait) ? '#e91e8c' : 'var(--foreground)',
                  }}
                >
                  {trait}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-semibold transition-all" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
                ← Terug
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}
              >
                {loading ? 'Aanmaken...' : `${data.name} aanmaken ✨`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
