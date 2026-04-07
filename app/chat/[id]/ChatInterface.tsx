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
  const [showSidebar, setShowSidebar] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true)
  const [gallery, setGallery] = useState<string[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [batching, setBatching] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

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

  // ─── Heartbeat speed per emotion ─────────────────────────────────────
  const heartbeatSpeed: Record<string, number> = {
    neutral: 3, happy: 2.2, excited: 1.2, sad: 4, flirty: 1.8,
    loving: 2.5, playful: 1.6, angry: 1, shy: 2.8, anxious: 1.3, calm: 4.5, hurt: 3.5,
  }
  const hbSpeed = heartbeatSpeed[emotion] || 3
  const isActive = loading || batching

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100dvh', background: '#0a0a14', color: 'rgba(255,255,255,0.92)', overflow: 'hidden', position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" }}>

      {/* ─── Heartbeat mood border — pulses around entire screen ────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        boxShadow: `inset 0 0 80px ${accent}12, inset 0 0 200px ${accent}06`,
        animation: `mood-border-pulse ${hbSpeed}s ease-in-out infinite`,
        transition: 'box-shadow 2s ease',
      }} />
      {/* Top edge glow line */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: 'none',
        background: `linear-gradient(90deg, transparent, ${accent}50, ${accent}80, ${accent}50, transparent)`,
        opacity: 0.6, animation: `mood-line-pulse ${hbSpeed}s ease-in-out infinite`,
        transition: 'background 2s ease',
      }} />

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      {showSidebar && (
        <aside className="chat-sidebar" style={{
          width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${accent}18`,
          background: 'rgba(6,4,14,0.95)', backdropFilter: 'blur(40px) saturate(180%)',
          zIndex: 10, overflowY: 'auto', transition: 'border-color 1s ease',
        }}>
          {/* Close button — visible on mobile */}
          <button className="chat-sidebar-close" onClick={() => setShowSidebar(false)} style={{
            display: 'none', position: 'absolute', top: 16, right: 16, zIndex: 20,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>

          {/* Profile header */}
          <div style={{ padding: '32px 24px 24px', textAlign: 'center', position: 'relative' }}>
            {/* Decorative gradient — emotion reactive */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 140,
              background: `linear-gradient(180deg, ${accent}12, transparent)`,
              borderRadius: '0 0 50% 50%', transition: 'background 2s ease',
            }} />

            {/* Avatar with heartbeat ring */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              {/* Heartbeat glow rings */}
              <div className="heartbeat-ring" style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: `2px solid ${accent}40`,
                animation: `heartbeat-pulse ${hbSpeed}s ease-in-out infinite`,
                transition: 'border-color 1s ease',
              }} />
              <div className="heartbeat-ring-outer" style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                border: `1px solid ${accent}20`,
                animation: `heartbeat-pulse ${hbSpeed}s ease-in-out infinite 0.15s`,
                transition: 'border-color 1s ease',
              }} />

              <div style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                border: `2px solid ${accent}50`,
                boxShadow: `0 0 20px ${accent}30, 0 0 40px ${accent}15`,
                transition: 'border-color 1s ease, box-shadow 1s ease',
              }}>
                {companion.avatar_url
                  ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{e.emoji}</div>
                }
              </div>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                background: '#22c55e', border: '3px solid #060514',
                boxShadow: '0 0 10px rgba(34,197,94,0.6)',
              }} />
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>{name}</div>

            {/* Status pill with heartbeat dot */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100,
              background: `${accent}10`, border: `1px solid ${accent}20`,
              marginBottom: 20, transition: 'all 1s ease',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: accent,
                boxShadow: `0 0 8px ${accent}`,
                animation: isActive ? `heartbeat-dot 0.6s ease-in-out infinite` : `heartbeat-dot ${hbSpeed}s ease-in-out infinite`,
                transition: 'background 1s ease, box-shadow 1s ease',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: accent, transition: 'color 1s ease' }}>
                {batching ? 'leest...' : loading ? 'typt...' : `${e.emoji} ${e.label}`}
              </span>
              {generating && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>· 📸</span>}
            </div>

            {/* Bond progress */}
            <div style={{
              background: 'rgba(255,255,255,0.025)', borderRadius: 16, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Band</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accent, transition: 'color 1s ease' }}>{bondLevel.emoji} {bondLevel.label}</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, width: `${bondProgress.pct}%`,
                  background: `linear-gradient(90deg, ${PURPLE}, ${accent})`,
                  boxShadow: `0 0 8px ${accent}40`,
                  transition: 'width 0.8s ease, background 1s ease',
                }} />
              </div>
              {bondProgress.toNext > 0 && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, textAlign: 'right' }}>
                  nog {bondProgress.toNext} berichten
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'Relatie', value: companion.relationship_style, icon: '💕' },
                { label: 'Berichten', value: messages.filter(m => !['typing', 'image_loading'].includes(m.type || '')).length, icon: '💬' },
                { label: "Foto's", value: gallery.length, icon: '📸' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '10px 4px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery button */}
          {gallery.length > 0 && (
            <div style={{ padding: '0 24px 16px' }}>
              <button onClick={() => setShowGallery(true)} style={{
                width: '100%', padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.2s', fontSize: 14, fontWeight: 600,
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}10`; ev.currentTarget.style.borderColor = `${accent}25` }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.025)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                <span style={{ fontSize: 20 }}>📸</span>
                <span>Galerij</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: accent, fontWeight: 700 }}>{gallery.length}</span>
              </button>
            </div>
          )}

          {/* Bottom actions */}
          <div style={{ padding: '16px 24px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Go to Chat — mobile only */}
            <button className="chat-sidebar-go-chat" onClick={() => setShowSidebar(false)} style={{
              display: 'none', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px',
              borderRadius: 12, background: `linear-gradient(135deg, ${PURPLE}, ${accent})`,
              border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 20px ${accent}30`,
              transition: 'all 0.2s',
            }}>
              💬 Chat met {name}
            </button>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px',
              borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}10`; ev.currentTarget.style.borderColor = `${accent}25`; ev.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.025)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              ← Dashboard
            </Link>
          </div>
        </aside>
      )}

      {/* ─── Chat Area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>

        {/* Header — WhatsApp-style */}
        <header className="chat-header" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
          borderBottom: `1px solid ${accent}10`,
          background: 'rgba(8,6,18,0.95)', backdropFilter: 'blur(40px) saturate(180%)', flexShrink: 0,
          transition: 'border-color 1s ease',
        }}>
          {/* Back / sidebar toggle */}
          <button className="chat-header-back" onClick={() => setShowSidebar(s => !s)} style={{
            width: 32, height: 32, borderRadius: 8, background: 'none',
            border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}>
            ‹
          </button>

          {/* Avatar with mini heartbeat — clickable */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => companion.avatar_url && setLightboxImg(companion.avatar_url)}>
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: `1.5px solid ${accent}35`,
              animation: `heartbeat-pulse ${hbSpeed}s ease-in-out infinite`,
              transition: 'border-color 1s ease',
            }} />
            <div style={{
              width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
              border: `1.5px solid ${accent}40`,
              boxShadow: `0 0 14px ${accent}25`,
              transition: 'border-color 1s ease, box-shadow 1s ease',
            }}>
              {companion.avatar_url
                ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{e.emoji}</div>
              }
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.2px' }}>{name}</div>
            <div style={{ fontSize: 12, color: accent, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 1s ease' }}>
              {batching ? <span style={{ color: 'rgba(255,255,255,0.35)' }}>leest je berichten...</span>
                : loading ? (
                  <span style={{ color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    typt
                    <span style={{ display: 'flex', gap: 2 }}>
                      {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: accent, animation: `typing-dot 1.2s ${i * 0.15}s infinite`, transition: 'background 1s ease' }} />)}
                    </span>
                  </span>
                )
                : <><span>{e.emoji}</span> {e.label}</>
              }
            </div>
          </div>

          {/* Gallery shortcut in header */}
          {gallery.length > 0 && (
            <button onClick={() => setShowGallery(true)} style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              color: 'rgba(255,255,255,0.5)', position: 'relative',
            }}>
              📸
              <span style={{
                position: 'absolute', top: -4, right: -4, fontSize: 9, fontWeight: 800,
                background: accent, color: '#fff', borderRadius: 100, padding: '1px 5px',
                minWidth: 16, textAlign: 'center',
              }}>{gallery.length}</span>
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="chat-messages" style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
              {/* Heartbeat avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: -12, borderRadius: '50%',
                  border: `2px solid ${accent}30`,
                  animation: `heartbeat-pulse ${hbSpeed}s ease-in-out infinite`,
                }} />
                <div style={{
                  position: 'absolute', inset: -24, borderRadius: '50%',
                  border: `1px solid ${accent}15`,
                  animation: `heartbeat-pulse ${hbSpeed}s ease-in-out infinite 0.2s`,
                }} />
                <div style={{
                  width: 110, height: 110, borderRadius: 55, overflow: 'hidden',
                  border: `2px solid ${accent}35`,
                  boxShadow: `0 0 40px ${accent}25, 0 0 80px ${accent}10`,
                }}>
                  {companion.avatar_url
                    ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>💝</div>
                  }
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 32, fontWeight: 800, marginBottom: 10, letterSpacing: '-1px',
                  background: `linear-gradient(110deg, #f9a8d4 0%, ${PINK} 50%, #be185d 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Chat met {name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>Stuur een bericht om het gesprek te starten</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', animation: 'fadeIn 0.3s ease' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${accent}10`, border: `1px solid ${accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              }}>👀</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{name} leest je berichten...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply bar */}
        {replyTo && (
          <div className="chat-reply-bar" style={{
            padding: '8px 16px', background: 'rgba(8,6,18,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(20px)',
          }}>
            <div style={{ width: 3, height: 24, borderRadius: 2, background: accent, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>{replyTo.role === 'assistant' ? name : 'Jij'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {replyTo.type === 'image' ? '📷 Foto' : replyTo.content}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
          </div>
        )}

        {/* Input bar — WhatsApp style */}
        <div className="chat-input-bar" style={{
          padding: '8px 12px 12px', borderTop: `1px solid ${accent}08`,
          background: 'rgba(8,6,18,0.95)', backdropFilter: 'blur(40px) saturate(180%)', flexShrink: 0,
          position: 'relative', transition: 'border-color 1s ease',
        }}>
          {/* Emoji Picker Popup */}
          {showEmojis && (
            <div ref={emojiRef} className="chat-emoji-picker" style={{
              position: 'absolute', bottom: '100%', left: 12, marginBottom: 6,
              width: 340, maxHeight: 320, overflowY: 'auto',
              background: 'rgba(12,8,28,0.97)', backdropFilter: 'blur(40px) saturate(180%)',
              border: `1px solid ${accent}18`, borderRadius: 16,
              boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 0 20px ${accent}08`,
              padding: '10px 12px', zIndex: 50,
              animation: 'emojiSlideUp 0.2s cubic-bezier(0.34,1.2,0.64,1)',
            }}>
              <EmojiPicker onSelect={(emoji) => { insertEmoji(emoji); setShowEmojis(false) }} />
            </div>
          )}

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {/* Emoji button */}
            <button type="button" onClick={() => setShowEmojis(s => !s)} style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, opacity: showEmojis ? 1 : 0.5, transition: 'opacity 0.2s',
            }}>
              😊
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder={`Bericht...`}
              rows={1}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 22, resize: 'none',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.92)', outline: 'none', fontSize: 15, lineHeight: 1.45,
                transition: 'border-color 0.3s, box-shadow 0.3s',
                maxHeight: 100, fontFamily: 'inherit',
              }}
              onFocus={ev => { ev.target.style.borderColor = `${accent}35`; ev.target.style.boxShadow = `0 0 0 2px ${accent}08` }}
              onBlur={ev => { ev.target.style.borderColor = 'rgba(255,255,255,0.08)'; ev.target.style.boxShadow = 'none' }}
            />

            {/* Send button */}
            <button type="submit" disabled={!input.trim() || loading} style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: input.trim() && !loading ? accent : 'rgba(255,255,255,0.06)',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() && !loading ? `0 2px 12px ${accent}40` : 'none',
              opacity: input.trim() && !loading ? 1 : 0.3,
            }}>
              {loading
                ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'animate-spin-slow 0.7s linear infinite' }} />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              }
            </button>
          </form>

          <style>{`
            @keyframes emojiSlideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
            @keyframes heartbeat-pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              14% { transform: scale(1.08); opacity: 1; }
              28% { transform: scale(1); opacity: 0.6; }
              42% { transform: scale(1.05); opacity: 0.9; }
              56% { transform: scale(1); opacity: 0.5; }
            }
            @keyframes heartbeat-dot {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.4); opacity: 1; }
            }
            @keyframes ambient-breathe {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.15); }
            }
            @keyframes mood-border-pulse {
              0%, 100% { opacity: 0.3; }
              14% { opacity: 0.8; }
              28% { opacity: 0.35; }
              42% { opacity: 0.65; }
              56% { opacity: 0.3; }
            }
            @keyframes mood-line-pulse {
              0%, 100% { opacity: 0.3; }
              14% { opacity: 1; }
              28% { opacity: 0.4; }
              42% { opacity: 0.8; }
              56% { opacity: 0.3; }
            }
          `}</style>
        </div>
      </div>

      {/* Fullscreen Gallery */}
      {showGallery && gallery.length > 0 && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(4,2,10,0.97)', backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Gallery header */}
          <div style={{
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📸</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Galerij</span>
              <span style={{ fontSize: 13, color: accent, fontWeight: 600 }}>{gallery.length} foto&apos;s</span>
            </div>
            <button onClick={() => setShowGallery(false)} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
          {/* Gallery grid */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 12,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
            alignContent: 'start',
          }}>
            {gallery.map((url, i) => (
              <div key={i} onClick={() => { setLightboxImg(url); setShowGallery(false) }} style={{
                aspectRatio: '1', borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={ev => { ev.currentTarget.style.opacity = '1' }}
              >
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: '6px 0' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
          border: `1px solid ${accent}25`,
          boxShadow: `0 0 10px ${accent}15`,
          transition: 'border-color 1s ease, box-shadow 1s ease',
        }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{emotionEmoji}</div>
          }
        </div>
        <div style={{
          padding: '14px 20px', borderRadius: '20px 20px 20px 6px',
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}12`,
          backdropFilter: 'blur(20px)', transition: 'border-color 1s ease',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: accent,
                animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.6, transition: 'background 1s ease',
              }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes typing-bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-5px) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: isGrouped ? '2px 0' : '8px 0', alignItems: 'flex-end', gap: 12,
    }}>
      {/* Avatar — only show for first in group */}
      {!isUser && (
        <div style={{ width: 38, flexShrink: 0 }}>
          {!isGrouped && (
            <div style={{
              width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
              border: `1px solid ${accent}25`,
              boxShadow: `0 0 10px ${accent}15`,
              transition: 'border-color 1s ease, box-shadow 1s ease',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{emotionEmoji}</div>
              }
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isUser ? 'flex-end' : 'flex-start', position: 'relative' }}>
        {/* Reply reference */}
        {msg.replyTo && (
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '5px 12px',
            borderLeft: `2px solid ${accent}50`, background: 'rgba(255,255,255,0.02)', borderRadius: 8,
            maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'border-color 1s ease',
          }}>
            {msg.replyTo.content}
          </div>
        )}

        {isImage ? (
          <div onClick={() => onImageClick(msg.content)} style={{
            borderRadius: 18, overflow: 'hidden', cursor: 'pointer', maxWidth: 400,
            border: `1px solid ${accent}18`,
            boxShadow: `0 6px 30px rgba(0,0,0,0.4), 0 0 15px ${accent}08`,
            transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.transform = 'scale(1.02)'; ev.currentTarget.style.boxShadow = `0 10px 40px ${accent}20, 0 0 30px ${accent}10` }}
            onMouseLeave={ev => { ev.currentTarget.style.transform = 'scale(1)'; ev.currentTarget.style.boxShadow = `0 6px 30px rgba(0,0,0,0.4), 0 0 15px ${accent}08` }}
          >
            <img src={msg.content} style={{ width: '100%', display: 'block' }} alt="" />
          </div>
        ) : isImgLoading ? (
          <div style={{
            padding: '14px 20px', borderRadius: '20px 20px 20px 6px',
            background: `${accent}08`, border: `1px solid ${accent}18`,
            color: accent, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 1s ease',
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${accent}30`, borderTopColor: accent, animation: 'animate-spin-slow 0.8s linear infinite', transition: 'border-color 1s ease' }} />
            Foto maken...
          </div>
        ) : (
          <div onClick={handleBubbleClick} style={{
            padding: '12px 18px',
            borderRadius: isUser
              ? (isGrouped ? '20px 6px 6px 20px' : '20px 20px 6px 20px')
              : (isGrouped ? '6px 20px 20px 6px' : '20px 20px 20px 6px'),
            background: isUser
              ? `linear-gradient(135deg, rgba(91,66,243,0.35), rgba(233,30,140,0.3))`
              : `rgba(255,255,255,0.04)`,
            border: isUser ? `1px solid rgba(233,30,140,0.2)` : `1px solid ${accent}10`,
            backdropFilter: 'blur(20px)',
            fontSize: 15, lineHeight: 1.65, color: isUser ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
            wordBreak: 'break-word', cursor: 'pointer', userSelect: 'text',
            boxShadow: isUser
              ? '0 2px 12px rgba(233,30,140,0.12), 0 0 20px rgba(91,66,243,0.06)'
              : `0 1px 8px ${accent}06`,
            transition: 'all 0.2s ease, border-color 1s ease, box-shadow 1s ease',
          }}>
            {msg.content}
          </div>
        )}

        {/* Timestamp */}
        {!isGrouped && !isImgLoading && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', padding: '2px 4px', letterSpacing: '0.02em' }}>
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
            background: 'rgba(14,10,28,0.97)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${accent}18`,
            borderRadius: 14,
            boxShadow: `0 6px 30px rgba(0,0,0,0.6), 0 0 15px ${accent}08`,
            overflow: 'hidden',
            minWidth: 160,
            animation: 'menuPop 0.15s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            {[
              { icon: '↩', label: 'Reageren', action: handleReply },
              { icon: copied ? '✓' : '📋', label: copied ? 'Gekopieerd!' : 'Kopiëren', action: handleCopy },
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 16px',
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.8)', fontSize: 14, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s',
                borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}12` }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
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
