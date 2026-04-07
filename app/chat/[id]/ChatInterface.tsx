'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { getBondLevel, getBondProgress } from '@/lib/companions'
import AvatarPreview from '@/components/AvatarPreview'

// ─── Theme — matches landing page ──────────────────────────────────────────
const PINK = '#e91e8c'
const PURPLE = '#5b42f3'

const EMOTIONS: Record<string, { color: string; emoji: string; label: string }> = {
  neutral:  { color: '#8888aa', emoji: '😐', label: 'Online' },
  happy:    { color: '#fbbf24', emoji: '😊', label: 'Blij' },
  excited:  { color: '#f97316', emoji: '🤩', label: 'Opgewonden' },
  sad:      { color: '#60a5fa', emoji: '😢', label: 'Verdrietig' },
  flirty:   { color: '#f43f5e', emoji: '😏', label: 'Flirterig' },
  loving:   { color: '#ec4899', emoji: '🥰', label: 'Liefdevol' },
  playful:  { color: '#a78bfa', emoji: '😄', label: 'Speels' },
  angry:    { color: '#ef4444', emoji: '😠', label: 'Boos' },
  shy:      { color: '#fb7185', emoji: '😳', label: 'Verlegen' },
  anxious:  { color: '#818cf8', emoji: '😰', label: 'Onrustig' },
  calm:     { color: '#34d399', emoji: '😌', label: 'Rustig' },
  hurt:     { color: '#6366f1', emoji: '😔', label: 'Gekwetst' },
}

type Msg = {
  id: string; role: 'user' | 'assistant'; content: string; emotion: string
  type?: string; created_at: string; replyTo?: { content: string; role: string }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ChatInterface({ companion, initialMessages }: { companion: any; initialMessages: any[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [emotion, setEmotion] = useState(companion.emotion_state?.current_emotion || 'neutral')
  const [bondScore, setBondScore] = useState(companion.bond_score || 0)
  const [bondLevelNum, setBondLevelNum] = useState(companion.bond_level || 1)
  const [replyTo, setReplyTo] = useState<Msg | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [gallery, setGallery] = useState<string[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [batching, setBatching] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const batchRef = useRef<string[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const e = EMOTIONS[emotion] || EMOTIONS.neutral
  const accent = e.color
  const bondLevel = getBondLevel(bondScore)
  const bondProgress = getBondProgress(bondScore)
  const name = companion.name

  useEffect(() => {
    setGallery(initialMessages.filter(m => m.type === 'image').map(m => m.content))
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { return () => { if (batchTimerRef.current) clearTimeout(batchTimerRef.current) } }, [])

  // Close emoji picker on click outside
  useEffect(() => {
    if (!showEmojis) return
    const handler = (ev: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(ev.target as Node)) setShowEmojis(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmojis])

  // Insert emoji at cursor position
  const insertEmoji = useCallback((emoji: string) => {
    const ta = inputRef.current
    if (ta) {
      const start = ta.selectionStart || 0
      const end = ta.selectionEnd || 0
      const before = input.slice(0, start)
      const after = input.slice(end)
      setInput(before + emoji + after)
      // Restore cursor position after emoji
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus() }, 0)
    } else {
      setInput(prev => prev + emoji)
    }
  }, [input])

  // ─── Input handler ───────────────────────────────────────────────────
  function onInputChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(ev.target.value)
    ev.target.style.height = 'auto'
    ev.target.style.height = Math.min(ev.target.scrollHeight, 140) + 'px'
  }

  // ─── Batch flush ─────────────────────────────────────────────────────
  const flushBatch = useCallback(async () => {
    const batch = [...batchRef.current]
    batchRef.current = []
    setBatching(false)
    if (!batch.length) return
    setLoading(true)

    const combined = batch.join('\n')
    setMessages(prev => [...prev, { id: 'typing', role: 'assistant', content: '...', emotion: 'neutral', type: 'typing', created_at: new Date().toISOString() }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id, message: combined, history: messagesRef.current.filter(m => m.type !== 'typing').slice(-14) }),
      })
      const data = await res.json()
      const aiEmotion = data.emotion || 'neutral'
      const aiMsgs: string[] = Array.isArray(data.messages) && data.messages.length ? data.messages : [data.text || '...']

      setMessages(prev => prev.filter(m => m.id !== 'typing'))
      setEmotion(aiEmotion)
      if (data.bondScore !== undefined) setBondScore(data.bondScore)
      if (data.bondLevel !== undefined) setBondLevelNum(data.bondLevel)

      for (let i = 0; i < aiMsgs.length; i++) {
        if (i > 0) {
          setMessages(prev => [...prev, { id: 'typing', role: 'assistant', content: '...', emotion: aiEmotion, type: 'typing', created_at: new Date().toISOString() }])
          await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
          setMessages(prev => prev.filter(m => m.id !== 'typing'))
        }
        setMessages(prev => [...prev, { id: `ai_${Date.now()}_${i}`, role: 'assistant', content: aiMsgs[i], emotion: aiEmotion, created_at: new Date().toISOString() }])
      }

      // Unlock chat input BEFORE image generation so user can keep chatting
      setLoading(false)
      inputRef.current?.focus()

      if (data.generateImage) {
        setGenerating(true)
        const lid = `imgload_${Date.now()}`
        setMessages(prev => [...prev, { id: lid, role: 'assistant', content: '📸', emotion: aiEmotion, type: 'image_loading', created_at: new Date().toISOString() }])
        try {
          const ir = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: data.generateImage, avatarUrl: companion.avatar_url }) })
          const id = await ir.json()
          if (id.url && !id.error) {
            setMessages(prev => prev.map(m => m.id === lid ? { ...m, content: id.url, type: 'image' } : m))
            setGallery(prev => [id.url, ...prev])
            // Save image to database so it persists across sessions
            fetch('/api/chat/save-image', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companionId: companion.id, imageUrl: id.url }),
            }).catch(() => {}) // fire-and-forget
          } else {
            // Image failed or was blocked — remove loading indicator, show a message
            setMessages(prev => prev.filter(m => m.id !== lid))
            setMessages(prev => [...prev, { id: `imgfail_${Date.now()}`, role: 'assistant', content: 'Hmm die foto lukte niet... probeer het later nog eens 📸', emotion: aiEmotion, created_at: new Date().toISOString() }])
          }
        } catch {
          setMessages(prev => prev.filter(m => m.id !== lid))
          setMessages(prev => [...prev, { id: `imgfail_${Date.now()}`, role: 'assistant', content: 'Oeps, foto kon niet geladen worden 😅', emotion: aiEmotion, created_at: new Date().toISOString() }])
        }
        setGenerating(false)
      }
    } catch { setMessages(prev => prev.filter(m => m.id !== 'typing')); setLoading(false) }
    inputRef.current?.focus()
  }, [companion.id])

  // ─── Send message ────────────────────────────────────────────────────
  const sendMessage = useCallback((ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const cr = replyTo
    setReplyTo(null)

    setMessages(prev => [...prev, {
      id: `u_${Date.now()}`, role: 'user', content: msg, emotion: 'neutral',
      created_at: new Date().toISOString(),
      replyTo: cr ? { content: cr.content, role: cr.role } : undefined,
    }])

    batchRef.current.push(msg)
    setBatching(true)
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(() => { batchTimerRef.current = null; flushBatch() }, 3000)
    inputRef.current?.focus()
  }, [input, loading, replyTo, flushBatch])

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); sendMessage() }
    if (ev.key === 'Escape') setReplyTo(null)
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100dvh', background: '#060514', color: 'rgba(255,255,255,0.92)', overflow: 'hidden', position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" }}>

      {/* Ambient glows — landing page style */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(233,30,140,0.08) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(91,66,243,0.06) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
      </div>

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      {showSidebar && (
        <aside style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid rgba(233,30,140,0.1)`,
          background: 'rgba(6,4,14,0.92)', backdropFilter: 'blur(40px) saturate(180%)',
          zIndex: 10, overflowY: 'auto',
        }}>
          {/* Profile header */}
          <div style={{ padding: '36px 28px 28px', textAlign: 'center', position: 'relative' }}>
            {/* Decorative gradient */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: `linear-gradient(180deg, rgba(233,30,140,0.08), transparent)`, borderRadius: '0 0 50% 50%' }} />

            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
              <AvatarPreview src={companion.avatar_url} name={name} accent={PINK} fallbackEmoji={e.emoji} size={110} borderRadius={55} />
              <div style={{
                position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                background: '#22c55e', border: '3px solid #060514',
                boxShadow: '0 0 12px rgba(34,197,94,0.5)',
              }} />
            </div>

            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{name}</div>

            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 100,
              background: `rgba(233,30,140,0.08)`, border: `1px solid rgba(233,30,140,0.15)`,
              marginBottom: 22, transition: 'all 0.6s',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 10px ${accent}` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>
                {batching ? 'leest...' : loading ? 'typt...' : `${e.emoji} ${e.label}`}
              </span>
              {generating && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>· 📸</span>}
            </div>

            {/* Bond progress */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: '16px 18px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>Band</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: PINK }}>{bondLevel.emoji} {bondLevel.label}</span>
              </div>
              <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 5, width: `${bondProgress.pct}%`, background: `linear-gradient(90deg, ${PURPLE}, ${PINK})`, transition: 'width 0.8s ease' }} />
              </div>
              {bondProgress.toNext > 0 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8, textAlign: 'right' }}>
                  nog {bondProgress.toNext} berichten
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: '0 28px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Relatie', value: companion.relationship_style, icon: '💕' },
                { label: 'Berichten', value: messages.filter(m => !['typing', 'image_loading'].includes(m.type || '')).length, icon: '💬' },
                { label: "Foto's", value: gallery.length, icon: '📸' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '12px 6px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div style={{ padding: '0 28px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Galerij
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {gallery.slice(0, 9).map((url, i) => (
                  <div key={i} onClick={() => setLightboxImg(url)} style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1',
                    border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                  }}
                    onMouseEnter={ev => { ev.currentTarget.style.transform = 'scale(1.06)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.35)'; ev.currentTarget.style.boxShadow = '0 0 20px rgba(233,30,140,0.15)' }}
                    onMouseLeave={ev => { ev.currentTarget.style.transform = 'scale(1)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; ev.currentTarget.style.boxShadow = 'none' }}
                  >
                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div style={{ padding: '18px 28px', marginTop: 'auto' }}>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px',
              borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.08)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.2)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              ← Dashboard
            </Link>
          </div>
        </aside>
      )}

      {/* ─── Chat Area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 20, padding: '18px 64px',
          borderBottom: '1px solid rgba(233,30,140,0.08)',
          background: 'rgba(6,4,14,0.88)', backdropFilter: 'blur(36px) saturate(180%)', flexShrink: 0,
        }}>
          <button onClick={() => setShowSidebar(s => !s)} style={{
            width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.1)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.2)' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            {showSidebar ? '◂' : '▸'}
          </button>

          <div style={{
            width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
            border: '1px solid rgba(233,30,140,0.2)',
            boxShadow: '0 0 18px rgba(233,30,140,0.2), 0 0 8px rgba(91,66,243,0.15)',
          }}>
            {companion.avatar_url
              ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{e.emoji}</div>
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,0.92)' }}>{name}</div>
            <div style={{ fontSize: 16, color: accent, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.5s' }}>
              {batching ? <span style={{ color: 'rgba(255,255,255,0.4)' }}>leest je berichten...</span>
                : loading ? <span style={{ color: 'rgba(255,255,255,0.4)' }}>aan het typen...</span>
                : <><span>{e.emoji}</span> {e.label}</>
              }
            </div>
          </div>

          <div style={{
            fontSize: 14, padding: '7px 16px', borderRadius: 100,
            background: `linear-gradient(135deg, rgba(91,66,243,0.15), rgba(233,30,140,0.15))`,
            border: `1px solid rgba(233,30,140,0.2)`,
            color: PINK, fontWeight: 700, letterSpacing: 0.3,
          }}>
            {bondLevel.emoji} Lvl {bondLevelNum}
          </div>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '36px 64px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
              <div style={{
                width: 120, height: 120, borderRadius: 60, overflow: 'hidden',
                border: '2px solid rgba(233,30,140,0.2)',
                boxShadow: '0 0 40px rgba(233,30,140,0.2), 0 0 80px rgba(91,66,243,0.1)',
              }}>
                {companion.avatar_url
                  ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>💝</div>
                }
              </div>
              <div>
                <div style={{
                  fontSize: 38, fontWeight: 800, marginBottom: 12,
                  background: `linear-gradient(110deg, #f9a8d4 0%, ${PINK} 50%, #be185d 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Chat met {name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }}>Stuur een bericht om het gesprek te starten</div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const prev = messages[idx - 1]
            const isGrouped = prev && prev.role === msg.role && !['typing', 'image_loading'].includes(prev.type || '') && msg.type !== 'typing' && msg.type !== 'image_loading'
            return (
              <ChatBubble key={msg.id} msg={msg} accent={accent} name={name} isGrouped={!!isGrouped}
                onReply={() => setReplyTo(msg)} onImageClick={setLightboxImg}
                avatarUrl={companion.avatar_url} emotionEmoji={e.emoji} />
            )
          })}

          {/* Batching indicator */}
          {batching && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', animation: 'fadeIn 0.3s ease' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `rgba(233,30,140,0.08)`, border: `1px solid rgba(233,30,140,0.15)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>👀</div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{name} leest je berichten...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply bar */}
        {replyTo && (
          <div style={{
            padding: '12px 64px', background: 'rgba(6,4,14,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(20px)',
          }}>
            <div style={{ width: 3, height: 32, borderRadius: 2, background: `linear-gradient(180deg, ${PURPLE}, ${PINK})`, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: PINK }}>Reageer op {replyTo.role === 'assistant' ? name : 'jezelf'}</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {replyTo.type === 'image' ? '📷 Foto' : replyTo.content}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>×</button>
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: '20px 64px 30px', borderTop: '1px solid rgba(233,30,140,0.08)',
          background: 'rgba(6,4,14,0.88)', backdropFilter: 'blur(36px) saturate(180%)', flexShrink: 0,
          position: 'relative',
        }}>
          {/* Emoji Picker Popup */}
          {showEmojis && (
            <div ref={emojiRef} style={{
              position: 'absolute', bottom: '100%', left: 64, marginBottom: 8,
              width: 380, maxHeight: 360, overflowY: 'auto',
              background: 'rgba(12,8,28,0.96)', backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(233,30,140,0.15)', borderRadius: 20,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(233,30,140,0.08)',
              padding: '14px 16px', zIndex: 50,
              animation: 'emojiSlideUp 0.2s cubic-bezier(0.34,1.2,0.64,1)',
            }}>
              <EmojiPicker onSelect={(emoji) => { insertEmoji(emoji); setShowEmojis(false) }} />
            </div>
          )}

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder={`Bericht aan ${name}...`}
              rows={1}
              style={{
                flex: 1, padding: '20px 28px', borderRadius: 32, resize: 'none',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.92)', outline: 'none', fontSize: 20, lineHeight: 1.5,
                transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
                maxHeight: 140, fontFamily: 'inherit',
              }}
              onFocus={ev => { ev.target.style.borderColor = 'rgba(233,30,140,0.35)'; ev.target.style.boxShadow = '0 0 0 3px rgba(233,30,140,0.08)'; ev.target.style.background = 'rgba(255,255,255,0.06)' }}
              onBlur={ev => { ev.target.style.borderColor = 'rgba(255,255,255,0.08)'; ev.target.style.boxShadow = 'none'; ev.target.style.background = 'rgba(255,255,255,0.04)' }}
            />

            {/* Emoji button */}
            <button type="button" onClick={() => setShowEmojis(s => !s)} style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: showEmojis ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.04)',
              border: showEmojis ? '1px solid rgba(233,30,140,0.25)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, transition: 'all 0.2s',
            }}
              onMouseEnter={ev => { if (!showEmojis) { ev.currentTarget.style.background = 'rgba(233,30,140,0.08)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.2)' } }}
              onMouseLeave={ev => { if (!showEmojis) { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
            >
              😊
            </button>

            {/* Send button */}
            <button type="submit" disabled={!input.trim() || loading} style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: input.trim() && !loading ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : 'rgba(255,255,255,0.04)',
              border: input.trim() && !loading ? 'none' : '1px solid rgba(255,255,255,0.06)',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
              boxShadow: input.trim() && !loading ? '0 4px 24px rgba(233,30,140,0.3), 0 0 40px rgba(91,66,243,0.15)' : 'none',
              transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.9)',
              opacity: input.trim() && !loading ? 1 : 0.4,
            }}>
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'animate-spin-slow 0.7s linear infinite' }} />
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              }
            </button>
          </form>

          <style>{`@keyframes emojiSlideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} gallery={gallery} onNavigate={setLightboxImg} />
    </div>
  )
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────
function ChatBubble({ msg, accent, name, isGrouped, onReply, onImageClick, avatarUrl, emotionEmoji }: {
  msg: Msg; accent: string; name: string; isGrouped: boolean
  onReply: () => void; onImageClick: (u: string) => void; avatarUrl?: string; emotionEmoji: string
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isUser = msg.role === 'user'
  const isTyping = msg.type === 'typing'
  const isImgLoading = msg.type === 'image_loading'
  const isImage = msg.type === 'image'

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return
    const handler = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  // Handle bubble click → show context menu
  const handleBubbleClick = (ev: React.MouseEvent) => {
    if (isTyping || isImgLoading) return
    if (isImage) { onImageClick(msg.content); return }
    ev.preventDefault()
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({
      x: isUser ? rect.left : rect.right,
      y: rect.top - 8,
    })
    setShowMenu(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    setShowMenu(false)
  }

  const handleReply = () => {
    onReply()
    setShowMenu(false)
  }

  if (isTyping) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '10px 0' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
          border: '1px solid rgba(233,30,140,0.15)',
          boxShadow: '0 0 12px rgba(233,30,140,0.1)',
        }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{emotionEmoji}</div>
          }
        </div>
        <div style={{
          padding: '22px 30px', borderRadius: '28px 28px 28px 8px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 11, height: 11, borderRadius: '50%', background: PINK,
                animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.7,
              }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes typing-bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: isGrouped ? '4px 0' : '12px 0', alignItems: 'flex-end', gap: 16,
    }}>
      {/* Avatar — only show for first in group */}
      {!isUser && (
        <div style={{ width: 56, flexShrink: 0 }}>
          {!isGrouped && (
            <div style={{
              width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
              border: '1px solid rgba(233,30,140,0.15)',
              boxShadow: '0 0 12px rgba(233,30,140,0.1)',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{emotionEmoji}</div>
              }
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isUser ? 'flex-end' : 'flex-start', position: 'relative' }}>
        {/* Reply reference */}
        {msg.replyTo && (
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '6px 14px',
            borderLeft: `2px solid ${PINK}60`, background: 'rgba(255,255,255,0.02)', borderRadius: 10,
            maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {msg.replyTo.content}
          </div>
        )}

        {isImage ? (
          <div onClick={() => onImageClick(msg.content)} style={{
            borderRadius: 22, overflow: 'hidden', cursor: 'pointer', maxWidth: 480,
            border: '1px solid rgba(233,30,140,0.12)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 20px rgba(233,30,140,0.08)',
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.transform = 'scale(1.02)'; ev.currentTarget.style.boxShadow = '0 12px 50px rgba(233,30,140,0.2), 0 0 40px rgba(91,66,243,0.1)' }}
            onMouseLeave={ev => { ev.currentTarget.style.transform = 'scale(1)'; ev.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4), 0 0 20px rgba(233,30,140,0.08)' }}
          >
            <img src={msg.content} style={{ width: '100%', display: 'block' }} alt="" />
          </div>
        ) : isImgLoading ? (
          <div style={{
            padding: '22px 30px', borderRadius: '28px 28px 28px 8px',
            background: 'rgba(233,30,140,0.05)', border: `1px solid rgba(233,30,140,0.12)`,
            color: PINK, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid rgba(233,30,140,0.25)`, borderTopColor: PINK, animation: 'animate-spin-slow 0.8s linear infinite' }} />
            Foto maken...
          </div>
        ) : (
          <div onClick={handleBubbleClick} style={{
            padding: '20px 28px',
            borderRadius: isUser
              ? (isGrouped ? '28px 8px 8px 28px' : '28px 28px 8px 28px')
              : (isGrouped ? '8px 28px 28px 8px' : '28px 28px 28px 8px'),
            background: isUser
              ? `linear-gradient(135deg, rgba(91,66,243,0.45), rgba(233,30,140,0.4))`
              : 'rgba(255,255,255,0.05)',
            border: isUser ? '1px solid rgba(233,30,140,0.25)' : '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            fontSize: 20, lineHeight: 1.7, color: isUser ? 'white' : 'rgba(255,255,255,0.92)',
            wordBreak: 'break-word', cursor: 'pointer', userSelect: 'text',
            boxShadow: isUser ? '0 4px 20px rgba(233,30,140,0.15), 0 0 30px rgba(91,66,243,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}>
            {msg.content}
          </div>
        )}

        {/* Timestamp */}
        {!isGrouped && !isImgLoading && (
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', padding: '4px 6px' }}>
            {new Date(msg.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Context menu — WhatsApp style */}
        {showMenu && menuPos && (
          <div ref={menuRef} style={{
            position: 'fixed',
            top: menuPos.y,
            ...(isUser ? { right: window.innerWidth - menuPos.x } : { left: menuPos.x }),
            transform: 'translateY(-100%)',
            zIndex: 100,
            background: 'rgba(18,12,36,0.97)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(233,30,140,0.15)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(233,30,140,0.08)',
            overflow: 'hidden',
            minWidth: 180,
            animation: 'menuPop 0.15s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            {[
              { icon: '↩', label: 'Reageren', action: handleReply },
              { icon: copied ? '✓' : '📋', label: copied ? 'Gekopieerd!' : 'Kopiëren', action: handleCopy },
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                width: '100%', padding: '14px 20px',
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.85)', fontSize: 16, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s',
                borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.1)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes menuPop { from { opacity: 0; transform: translateY(-90%) scale(0.95) } to { opacity: 1; transform: translateY(-100%) scale(1) } }`}</style>
    </div>
  )
}

// ─── Emoji Picker ───────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    label: '😍 Liefde',
    emojis: ['❤️', '😍', '🥰', '😘', '💕', '💖', '💗', '💓', '💘', '💝', '💞', '💋', '😻', '🫶', '♥️', '🩷'],
  },
  {
    label: '😏 Flirten',
    emojis: ['😏', '😈', '🔥', '💦', '🍑', '🍆', '😜', '😋', '🤤', '👅', '💅', '🫦', '😮‍💨', '🥵', '✨', '💫'],
  },
  {
    label: '😊 Blij',
    emojis: ['😊', '😄', '😁', '🤗', '😆', '🥹', '☺️', '😌', '🤭', '😇', '🎉', '🎊', '💃', '🕺', '🙌', '👏'],
  },
  {
    label: '😂 Grappig',
    emojis: ['😂', '🤣', '😹', '💀', '☠️', '🫠', '🤪', '😝', '🙃', '😅', '🫢', '🤡', '👀', '🙈', '🙊', '🫣'],
  },
  {
    label: '😢 Gevoel',
    emojis: ['😢', '😭', '🥺', '😔', '😞', '💔', '😿', '🫂', '😰', '😳', '🙁', '😟', '😤', '😠', '😡', '🤬'],
  },
  {
    label: '👋 Gebaren',
    emojis: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤞', '🫰', '🤟', '🤘', '👍', '👎', '✌️', '💪', '🫵', '👈'],
  },
  {
    label: '🌙 Overig',
    emojis: ['🌙', '⭐', '🌟', '🌈', '🦋', '🌹', '🌸', '🌺', '🍷', '🥂', '☕', '🎵', '🎶', '📸', '🎀', '💐'],
  },
]

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto',
        paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: activeTab === i ? 'rgba(233,30,140,0.12)' : 'transparent',
            border: activeTab === i ? '1px solid rgba(233,30,140,0.2)' : '1px solid transparent',
            color: activeTab === i ? PINK : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
      }}>
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)} style={{
            width: '100%', aspectRatio: '1', borderRadius: 12, fontSize: 26,
            background: 'transparent', border: '1px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.1)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.15)'; ev.currentTarget.style.transform = 'scale(1.15)' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.transform = 'scale(1)' }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose, gallery, onNavigate }: {
  src: string | null; onClose: () => void; gallery: string[]; onNavigate: (u: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!src) return
    const h = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
      if ((ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') && gallery.length > 1) {
        const i = gallery.indexOf(src)
        if (i === -1) return
        onNavigate(ev.key === 'ArrowRight' ? gallery[(i + 1) % gallery.length] : gallery[(i - 1 + gallery.length) % gallery.length])
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [src, gallery, onClose, onNavigate])

  if (!src || !mounted) return null
  const idx = gallery.indexOf(src)

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(6,4,14,0.96)', backdropFilter: 'blur(24px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.2s ease',
    }}>
      <button onClick={ev => { ev.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 24, right: 24, zIndex: 10, width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
      }}
        onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.15)'; ev.currentTarget.style.borderColor = 'rgba(233,30,140,0.3)' }}
        onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >✕</button>

      {gallery.length > 1 && idx >= 0 && (
        <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          {idx + 1} / {gallery.length}
        </div>
      )}

      {gallery.length > 1 && ['left', 'right'].map(dir => (
        <button key={dir} onClick={ev => {
          ev.stopPropagation()
          const i = gallery.indexOf(src)
          onNavigate(dir === 'right' ? gallery[(i + 1) % gallery.length] : gallery[(i - 1 + gallery.length) % gallery.length])
        }} style={{
          position: 'absolute', [dir === 'left' ? 'left' : 'right']: 20, top: '50%', transform: 'translateY(-50%)',
          width: 50, height: 50, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.15)' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >{dir === 'left' ? '‹' : '›'}</button>
      ))}

      <div onClick={ev => ev.stopPropagation()} style={{
        maxWidth: '90vw', maxHeight: '88vh', borderRadius: 18, overflow: 'hidden',
        boxShadow: `0 0 80px rgba(233,30,140,0.15), 0 0 40px rgba(91,66,243,0.1), 0 24px 80px rgba(0,0,0,0.6)`,
        border: '1px solid rgba(233,30,140,0.2)',
        animation: 'avp-scale-in 0.25s cubic-bezier(0.34,1.2,0.64,1) both', cursor: 'default',
      }}>
        <img src={src} alt="" style={{ display: 'block', maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain' }} />
      </div>

      <style>{`
        @keyframes avp-scale-in { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>,
    document.body
  )
}
