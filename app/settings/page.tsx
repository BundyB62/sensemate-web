import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: companions } = await supabase.from('companions').select('id, name, bond_score, bond_level').eq('user_id', user.id)

  const plan = profile?.plan || 'free'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--card-border)', padding: '0 16px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(30px)', background: 'rgba(6,6,17,0.85)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/dashboard" style={{
            fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none',
            padding: '7px 14px', borderRadius: 100, background: 'var(--muted)', border: '1px solid var(--card-border)',
          }}>← Dashboard</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ fontSize: 13, color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Log out
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px', position: 'relative', zIndex: 1 }}>
        <div className="animate-fadeup">
          <div style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600, marginBottom: 6 }}>Account</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 40 }}>Settings</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="stagger">

          {/* Account info */}
          <section className="glass" style={{ borderRadius: 22, padding: '28px 32px' }}>
            <SectionTitle icon="👤" title="Account" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoRow label="Email" value={user.email || '—'} />
              <InfoRow label="Member since" value={new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <InfoRow label="Plan" value={
                <span style={{
                  padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: plan === 'premium' ? 'rgba(233,30,140,0.2)' : plan === 'pro' ? 'rgba(168,85,247,0.2)' : 'var(--muted)',
                  color: plan === 'premium' ? '#e91e8c' : plan === 'pro' ? '#a855f7' : 'var(--muted-fg)',
                }}>
                  {plan === 'premium' ? '✨ Premium' : plan === 'pro' ? '⚡ Pro' : '🆓 Free'}
                </span>
              } />
            </div>
          </section>

          {/* Companions */}
          <section className="glass" style={{ borderRadius: 22, padding: '28px 32px' }}>
            <SectionTitle icon="💝" title="Your companions" />
            {companions && companions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {companions.map((c: any) => (
                  <div key={c.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--card-border)',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>Level {c.bond_level || 1} · {c.bond_score || 0} pts</span>
                      <Link href={`/chat/${c.id}`} style={{
                        fontSize: 12, color: '#e91e8c', textDecoration: 'none', fontWeight: 600,
                        padding: '5px 12px', borderRadius: 100, background: 'rgba(233,30,140,0.1)',
                        border: '1px solid rgba(233,30,140,0.25)',
                      }}>Chat →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-fg)', fontSize: 14 }}>
                No companions yet. <Link href="/onboarding" style={{ color: '#e91e8c', textDecoration: 'none' }}>Create one →</Link>
              </div>
            )}
          </section>

          {/* Plan & limits */}
          <section className="glass" style={{ borderRadius: 22, padding: '28px 32px' }}>
            <SectionTitle icon="⭐" title="Plan & limits" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Companions', value: plan === 'free' ? '1' : plan === 'pro' ? '3' : '∞' },
                { label: 'Messages/day', value: plan === 'free' ? '50' : '∞' },
                { label: 'Photos/day', value: plan === 'free' ? '5' : plan === 'pro' ? '50' : '∞' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            {plan === 'free' && (
              <Link href="/upgrade" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', width: '100%', display: 'flex' }}>
                ✨ Upgrade to Pro
              </Link>
            )}
          </section>

          {/* Account actions */}
          <section className="glass" style={{ borderRadius: 22, padding: '28px 32px' }}>
            <SectionTitle icon="🔐" title="Account actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <form action="/auth/signout" method="post">
                <button type="submit" style={{
                  padding: '11px 22px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'var(--muted)', border: '1px solid var(--card-border)', color: 'var(--fg-2)',
                  transition: 'all 0.18s', width: '100%',
                }}>
                  Log out
                </button>
              </form>
            </div>
          </section>

          {/* Danger zone */}
          <section className="glass" style={{ borderRadius: 22, padding: '28px 32px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <SectionTitle icon="⚠️" title="Danger zone" />
            <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
              Deleting your account will permanently remove all companions, conversations, and photos. This cannot be undone.
            </p>
            <button style={{
              padding: '11px 22px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
              transition: 'all 0.18s',
            }}>
              Delete account
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(233,30,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid var(--card-border)' }}>
      <span style={{ fontSize: 14, color: 'var(--muted-fg)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{value}</span>
    </div>
  )
}
