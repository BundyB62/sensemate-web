import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companions } = await supabase
    .from('companions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const maxCompanions = profile?.plan === 'premium' ? Infinity : profile?.plan === 'pro' ? 3 : 1
  const canAddMore = (companions?.length ?? 0) < maxCompanions

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="border-b px-8 py-4 flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }} />
          <span className="text-lg font-bold gradient-text">SenseMate</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-gray-500 hover:text-white transition-colors">Uitloggen</button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Jouw companions</h1>
            <p className="text-gray-400 mt-1">
              {companions?.length ?? 0} van {maxCompanions === Infinity ? '∞' : maxCompanions} companions
            </p>
          </div>
          {canAddMore ? (
            <Link href="/onboarding" className="px-6 py-3 rounded-full font-semibold text-white text-sm transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}>
              + Nieuwe companion
            </Link>
          ) : (
            <Link href="/upgrade" className="px-6 py-3 rounded-full font-semibold text-white text-sm transition-all hover:scale-105" style={{ background: 'var(--muted)' }}>
              ✨ Upgraden voor meer
            </Link>
          )}
        </div>

        {companions && companions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion: any) => (
              <Link key={companion.id} href={`/chat/${companion.id}`} className="group p-6 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(255,107,107,0.2))', border: '2px solid rgba(233,30,140,0.3)' }}>
                    {companion.avatar_url ? (
                      <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
                    ) : '😊'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-pink-400 transition-colors">{companion.name}</h2>
                    <p className="text-sm text-gray-400 capitalize">{companion.relationship_style}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Bond level {companion.bond_level}</span>
                  <span>→ Chatten</span>
                </div>
                {/* Bond progress bar */}
                <div className="mt-3 h-1 rounded-full" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, companion.bond_score)}%`, background: 'linear-gradient(90deg, #e91e8c, #ff6b6b)' }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl" style={{ border: '2px dashed var(--card-border)' }}>
            <div className="text-5xl mb-4">💝</div>
            <h2 className="text-xl font-semibold mb-2">Nog geen companion</h2>
            <p className="text-gray-400 mb-6">Maak je eerste AI companion aan en begin met chatten.</p>
            <Link href="/onboarding" className="px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}>
              Maak je companion aan →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
