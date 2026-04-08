import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBondLevel, getBondProgress } from '@/lib/companions'
import DeleteCompanionButton from '@/components/DeleteCompanionButton'
import AvatarPreview from '@/components/AvatarPreview'

const EMOTION_COLORS: Record<string, string> = {
  neutral: '#8888aa', happy: '#fbbf24', excited: '#f97316',
  sad: '#60a5fa', flirty: '#f43f5e', loving: '#ec4899',
  playful: '#a78bfa', angry: '#ef4444', shy: '#fb7185',
  anxious: '#818cf8', hurt: '#6366f1',
}
const EMOTION_EMOJIS: Record<string, string> = {
  neutral: '😐', happy: '😊', excited: '🤩', sad: '😢',
  flirty: '😏', loving: '🥰', playful: '😄', angry: '😠',
  shy: '😳', anxious: '😰', hurt: '😔',
}
const EMOTION_LABELS: Record<string, string> = {
  neutral: 'Online', happy: 'Happy', excited: 'Excited', sad: 'Sad',
  flirty: 'Flirty', loving: 'Loving', playful: 'Playful', angry: 'Angry',
  shy: 'Shy', anxious: 'Anxious', hurt: 'Hurt',
}
const REL_LABELS: Record<string, string> = {
  lover: 'Romantic Partner', soulmate: 'Soulmate', flirt: 'Flirt',
  bestfriend: 'Best Friend', mentor: 'Mentor & Coach',
  therapist: 'Support Companion', adventure: 'Adventure Partner', big_sibling: 'Big Sibling',
}
const PLAN_LIMITS: Record<string, number> = { free: 1, pro: 3, premium: 999 }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: companions }, { data: profile }] = await Promise.all([
    supabase.from('companions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const plan = profile?.plan || 'free'
  const maxCompanions = PLAN_LIMITS[plan] ?? 1
  const canAddMore = (companions?.length ?? 0) < maxCompanions

  return (
    <div style={{ background: '#07050f', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
      {/* Fixed atmospheric glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', right: '-5%', top: '0',
          width: '60%', height: '100vh',
          background: 'radial-gradient(ellipse at 65% 40%, rgba(180,100,20,0.12) 0%, rgba(140,70,10,0.05) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', left: '-5%', top: '20%',
          width: '40%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(60,20,120,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Nav — matching landing page */}
      <nav className="mobile-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 76,
        background: 'rgba(6,4,14,0.88)',
        borderBottom: '1px solid rgba(233,30,140,0.12)',
        backdropFilter: 'blur(36px)',
        overflow: 'hidden',
      }}>
        {/* Bottom glow line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(233,30,140,0.35) 30%, rgba(91,66,243,0.35) 70%, transparent 100%)',
        }} />

        <div className="mobile-nav-inner" style={{
          height: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', padding: '0 52px',
        }}>
          {/* Left — nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/settings" style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              padding: '8px 18px', borderRadius: 100,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            }}>Settings</Link>
          </div>

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
              fontSize: 10, fontWeight: 300, letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(249,168,212,0.35)', fontStyle: 'normal',
            }}>
              feel the connection
            </div>
          </Link>

          {/* Right — user info */}
          <div className="mobile-dash-right" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            <span className="mobile-hide" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.35)', padding: '6px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {user.email}
            </span>
            <span style={{
              fontSize: 10, padding: '5px 12px', borderRadius: 100, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: plan === 'premium' ? 'rgba(233,30,140,0.2)' : plan === 'pro' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
              color: plan === 'premium' ? '#f472b6' : plan === 'pro' ? '#a855f7' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${plan === 'premium' ? 'rgba(233,30,140,0.3)' : plan === 'pro' ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              {plan === 'premium' ? '✨ Premium' : plan === 'pro' ? '⚡ Pro' : 'Free'}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" style={{
                fontSize: 13, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer',
              }}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mobile-dash-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 52px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="mobile-dash-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 500, marginBottom: 10,
              background: 'linear-gradient(135deg, #e91e8c, #f472b6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Welcome back</div>
            <h1 className="mobile-dash-title" style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 10, lineHeight: 1.1, color: '#fff' }}>
              Your SenseMates
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>
              {companions?.length ?? 0} of {maxCompanions >= 999 ? '∞' : maxCompanions} active
            </p>
          </div>
          {canAddMore ? (
            <Link href="/onboarding" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              color: '#fff', borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(91,66,243,0.6), rgba(233,30,140,0.6))',
              border: '1px solid rgba(233,30,140,0.35)',
              boxShadow: '0 4px 20px rgba(233,30,140,0.2)',
            }}>
              + New SenseMate
            </Link>
          ) : (
            <Link href="/upgrade" style={{
              padding: '13px 28px', fontSize: 14, textDecoration: 'none', borderRadius: 100,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(233,30,140,0.2))',
              color: '#fff', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 600,
            }}>✨ Upgrade Plan</Link>
          )}
        </div>

        {/* Companions Grid */}
        {companions && companions.length > 0 ? (
          <>
            <div className="mobile-companion-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {companions.map((companion: any) => {
                const em = companion.emotion_state?.current_emotion || 'neutral'
                const accent = EMOTION_COLORS[em] || '#8888aa'
                const bondScore = companion.bond_score || 0
                const bondLvl = getBondLevel(bondScore)
                const bondProg = getBondProgress(bondScore)

                return (
                  <Link key={companion.id} href={`/chat/${companion.id}`} style={{ textDecoration: 'none' }}>
                    <div className="companion-card" style={{
                      borderRadius: 28, padding: 0,
                      border: `1px solid ${accent}20`,
                      background: `linear-gradient(160deg, rgba(15,12,35,0.95) 0%, ${accent}08 50%, rgba(15,12,35,0.95) 100%)`,
                      backdropFilter: 'blur(24px)',
                      position: 'relative', overflow: 'hidden',
                      boxShadow: `0 4px 40px rgba(0,0,0,0.4), 0 0 60px ${accent}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
                      transition: 'border-color 0.5s ease, box-shadow 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                      {/* Atmospheric glow — top */}
                      <div style={{
                        position: 'absolute', top: -80, right: -40, width: 250, height: 250,
                        borderRadius: '50%', background: `radial-gradient(circle, ${accent}20 0%, ${accent}08 40%, transparent 70%)`,
                        pointerEvents: 'none', filter: 'blur(20px)',
                      }} />
                      {/* Atmospheric glow — bottom left */}
                      <div style={{
                        position: 'absolute', bottom: -60, left: -40, width: 200, height: 200,
                        borderRadius: '50%', background: `radial-gradient(circle, rgba(91,66,243,0.12) 0%, transparent 70%)`,
                        pointerEvents: 'none', filter: 'blur(25px)',
                      }} />
                      {/* Shimmer edge top */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                        background: `linear-gradient(90deg, transparent 0%, ${accent}40 30%, ${accent}60 50%, ${accent}40 70%, transparent 100%)`,
                        pointerEvents: 'none',
                      }} />

                      <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 22 }}>
                          {/* Avatar */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <AvatarPreview
                              src={companion.avatar_url}
                              name={companion.name}
                              accent={accent}
                              fallbackEmoji={EMOTION_EMOJIS[em]}
                            />
                          <div style={{
                            position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%',
                            background: '#22c55e', border: '3px solid #07050f', boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                          }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {companion.name}
                          </div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
                            {REL_LABELS[companion.relationship_style] || companion.relationship_style}
                          </div>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 100,
                            background: `${accent}12`, border: `1px solid ${accent}25`,
                          }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>
                              {EMOTION_EMOJIS[em]} {EMOTION_LABELS[em]}
                            </span>
                          </div>
                        </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <DeleteCompanionButton companionId={companion.id} companionName={companion.name} />
                            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.15)' }}>→</div>
                          </div>
                        </div>

                        {/* Bond */}
                        <div style={{
                          padding: '14px 18px', borderRadius: 18,
                          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14 }}>{bondLvl.emoji}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{bondLvl.label}</span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>Level {bondLvl.level}/5</span>
                          </div>
                          <div style={{
                            height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 4,
                              width: `${bondProg.pct}%`,
                              background: `linear-gradient(90deg, ${accent}80, ${accent})`,
                              boxShadow: `0 0 12px ${accent}40`,
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Add new companion card */}
              {canAddMore && (
                <Link href="/onboarding" style={{ textDecoration: 'none' }}>
                  <div style={{
                    borderRadius: 24, padding: 28, minHeight: 220,
                    border: '1px dashed rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.015)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 12, transition: 'border-color 0.3s ease, background 0.3s ease',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, color: 'rgba(233,30,140,0.6)',
                    }}>+</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>New SenseMate</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Choose prebuilt or create your own</div>
                  </div>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="mobile-stats-grid" style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { icon: '💬', label: 'SenseMates', value: `${companions.length} / ${maxCompanions >= 999 ? '∞' : maxCompanions}` },
                { icon: '📸', label: 'Total Photos', value: String(companions.reduce((s: number, c: any) => s + (c.photo_count || 0), 0)) },
                { icon: '⭐', label: 'Plan', value: plan === 'premium' ? '✨ Premium' : plan === 'pro' ? '⚡ Pro' : 'Free' },
              ].map(stat => (
                <div key={stat.label} style={{
                  borderRadius: 20, padding: '22px 26px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, fontSize: 22,
                    background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px',
                      background: 'linear-gradient(135deg, #e91e8c, #f472b6)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* ─── Hero section with rotating showcase ─── */}
            <div style={{ textAlign: 'center', padding: '40px 24px 48px', position: 'relative' }}>
              {/* Ambient glow */}
              <div style={{
                position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 600, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(233,30,140,0.1) 0%, rgba(91,66,243,0.05) 50%, transparent 70%)',
                filter: 'blur(80px)', pointerEvents: 'none',
              }} />

              {/* Floating portrait gallery */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48,
                position: 'relative', perspective: 800,
              }}>
                {[
                  { img: '/showcase-1.jpg', rotate: '-6deg', y: 12, label: 'Blonde Goddess' },
                  { img: '/showcase-2.jpg', rotate: '-2deg', y: -8, label: 'Mysterious' },
                  { img: '/showcase-3.jpg', rotate: '1deg', y: 4, label: 'Latina Fire' },
                  { img: '/showcase-4.jpg', rotate: '3deg', y: -12, label: 'Dark Beauty' },
                  { img: '/showcase-5.jpg', rotate: '-1deg', y: 8, label: 'Playful Red' },
                  { img: '/showcase-6.jpg', rotate: '5deg', y: -4, label: 'Exotic' },
                ].map((card, i) => (
                  <div key={i} style={{
                    width: 140, flexShrink: 0,
                    transform: `rotate(${card.rotate}) translateY(${card.y}px)`,
                    transition: 'transform 0.4s ease',
                  }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: 18, overflow: 'hidden',
                      border: '2px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(233,30,140,0.08)',
                      position: 'relative',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        padding: '20px 10px 8px', textAlign: 'center',
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{card.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 style={{
                fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: '-1.5px',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                She&apos;s waiting for you
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, lineHeight: 1.8, maxWidth: 460, margin: '0 auto 12px' }}>
                Design every detail — her face, body, personality, and style.
                Chat, roleplay, and receive photos. Anything goes.
              </p>
              <p style={{
                color: 'rgba(249,168,212,0.5)', fontSize: 15, fontStyle: 'italic',
                maxWidth: 380, margin: '0 auto 44px',
              }}>
                No limits. No filters. Just you and her.
              </p>
              <Link href="/onboarding" className="hero-cta-pulse" style={{
                display: 'inline-flex', alignItems: 'center', padding: '18px 52px', fontSize: 18, fontWeight: 700,
                textDecoration: 'none', color: '#fff', borderRadius: 100,
                background: 'linear-gradient(135deg, rgba(91,66,243,0.55), rgba(233,30,140,0.55))',
                border: '1px solid rgba(233,30,140,0.5)',
                boxShadow: '0 6px 36px rgba(233,30,140,0.35), 0 0 80px rgba(91,66,243,0.15)',
                letterSpacing: '-0.01em',
              }}>
                Create Your SenseMate →
              </Link>
            </div>

            {/* ─── Feature highlights ─── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              maxWidth: 800, margin: '20px auto 0', padding: '0 24px',
            }}>
              {[
                { icon: '🎨', title: '6,000+ Looks', desc: 'Kies etniciteit, lichaam, haar, ogen, kleding' },
                { icon: '📸', title: 'AI Photos', desc: 'Elke pose, elke outfit, elk scenario' },
                { icon: '🔞', title: 'No Limits', desc: 'Volledige vrijheid. Geen filters.' },
              ].map(f => (
                <div key={f.title} style={{
                  padding: '24px 20px', borderRadius: 18, textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
