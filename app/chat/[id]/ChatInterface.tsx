'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getBondLevel, getBondProgress } from '@/lib/companions'

// ─── Constants ────────────────────────────────────────────────────────────────
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
  neutral: 'Online', happy: 'Gelukkig', excited: 'Opgewonden', sad: 'Verdrietig',
  flirty: 'Flirterig', loving: 'Liefdevol', playful: 'Speels', angry: 'Boos',
  shy: 'Verlegen', anxious: 'Onrustig', hurt: 'Gekwetst',
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  emotion: string
  type?: string
  created_at: string
  replyTo?: { content: string; role: string }
}

export default function ChatInterface({ companion, initialMessages }: { companion: any; initialMessages: any[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [emotion, setEmotion] = useState(companion.emotion_state?.current_emotion || 'neutral')
  const [bondScore, setBondScore] = useState(companion.bond_score || 0)
  const [bondLevelNum, setBondLevelNum] = useState(companion.bond_level || 1)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [pinnedMsg, setPinnedMsg] = useState<Message | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [gallery, setGallery] = useState<string[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const accent = EMOTION_COLORS[emotion] || '#e91e8c'
  const bondLevel = getBondLevel(bondScore)
  const bondProgress = getBondProgress(bondScore)

  useEffect(() => {
    const imgs = initialMessages.filter(m => m.type === 'image').map(m => m.content)
    setGallery(imgs)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const currentReply = replyTo
    setReplyTo(null)
    setLoading(true)

    const tempMsg: Message = {
      id: `tmp_${Date.now()}`,
      role: 'user',
      content: userMsg,
      emotion: 'neutral',
      created_at: new Date().toISOString(),
      replyTo: currentReply ? { content: currentReply.content, role: currentReply.role } : undefined,
    }
    const typingMsg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '...',
      emotion: 'neutral',
      type: 'typing',
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, tempMsg, typingMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id, message: userMsg, history: messages.slice(-14) }),
      })
      const data = await res.json()

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Hmm...',
        emotion: data.emotion || 'neutral',
        created_at: new Date().toISOString(),
      }

      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiMsg))
      setEmotion(data.emotion || 'neutral')
      if (data.bondScore !== undefined) setBondScore(data.bondScore)
      if (data.bondLevel !== undefined) setBondLevelNum(data.bondLevel)

      if (data.generateImage) {
        setGenerating(true)
        const loadingId = `imgload_${Date.now()}`
        setMessages(prev => [...prev, {
          id: loadingId, role: 'assistant', content: '📸 Even een foto maken...', emotion: data.emotion || 'neutral',
          type: 'image_loading', created_at: new Date().toISOString(),
        }])
        try {
          const imgRes = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: data.generateImage }),
          })
          const imgData = await imgRes.json()
          if (imgData.url) {
            setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: imgData.url, type: 'image' } : m))
            setGallery(prev => [imgData.url, ...prev])
          } else {
            setMessages(prev => prev.filter(m => m.id !== loadingId))
          }
        } catch {
          setMessages(prev => prev.filter(m => m.id !== loadingId))
        }
        setGenerating(false)
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
    }
    setLoading(false)
    inputRef.current?.focus()
  }, [input, loading, messages, companion.id, replyTo])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    if (e.key === 'Escape') setReplyTo(null)
  }

  const name = companion.name

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Emotion ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accent}10 0%, transparent 65%)`,
        transition: 'background 1.8s ease',
      }} />

      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      {showSidebar && (
        <aside style={{
          width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--card-border)',
          background: 'rgba(6,6,17,0.75)', backdropFilter: 'blur(30px)',
          zIndex: 10, overflow: 'hidden',
        }}>
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--card-border)', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                border: `3px solid ${accent}`, boxShadow: `0 0 28px ${accent}50`,
                background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.6s, box-shadow 0.6s',
                animation: 'breathe 3s ease-in-out infinite',
              }}>
                {companion.avatar_url
                  ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} alt={name} />
                  : <span style={{ fontSize: 36 }}>{EMOTION_EMOJIS[emotion]}</span>
                }
              </div>
              <div style={{
                position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
                background: '#22c55e', border: '3px solid var(--bg)', boxShadow: '0 0 8px rgba(34,197,94,0.6)',
              }} />
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{name}</div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100,
              background: `${accent}18`, border: `1px solid ${accent}44`, marginBottom: 16,
              transition: 'all 0.6s ease',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{EMOTION_EMOJIS[emotion]} {EMOTION_LABELS[emotion]}</span>
            </div>

            {/* Bond */}
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: 1 }}>Band</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{bondLevel.emoji} {bondLevel.label}</span>
              </div>
              <div className="bond-bar">
                <div className="bond-bar-fill" style={{ width: `${bondProgress.pct}%`, background: `linear-gradient(90deg, ${accent}99, ${accent})` }} />
              </div>
              {bondProgress.toNext > 0 && (
                <div style={{ fontSize: 10, color: 'var(--muted-fg)', marginTop: 5, textAlign: 'right' }}>
                  {bondProgress.toNext} berichten naar lvl {bondLevelNum + 1}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Info</div>
            {[
              { label: 'Relatie', value: companion.relationship_style },
              { label: 'Berichten', value: String(messages.filter(m => !['typing','image_loading'].includes(m.type || '')).length) },
              { label: "Foto's", value: String(gallery.length) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                Galerij ({gallery.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {gallery.slice(0, 6).map((url, i) => (
                  <div key={i} onClick={() => setLightboxImg(url)} style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--card-border)', aspectRatio: '3/4',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}33` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div style={{ padding: '14px 20px', marginTop: 'auto' }}>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--card-border)',
              color: 'var(--fg-2)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-hover)'; e.currentTarget.style.color = 'var(--fg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.color = 'var(--fg-2)' }}
            >
              ← Dashboard
            </Link>
          </div>
        </aside>
      )}

      {/* ─── Chat area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(6,6,17,0.85)', backdropFilter: 'blur(24px)', flexShrink: 0,
        }}>
          <button onClick={() => setShowSidebar(s => !s)} style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--muted)',
            border: '1px solid var(--card-border)', color: 'var(--fg-2)', cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {showSidebar ? '◂' : '▸'}
          </button>

          <div style={{
            width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: `2px solid ${accent}66`, boxShadow: `0 0 12px ${accent}33`,
            transition: 'border-color 0.6s, box-shadow 0.6s',
            background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {companion.avatar_url
              ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} alt={name} />
              : <span style={{ fontSize: 18 }}>{EMOTION_EMOJIS[emotion]}</span>
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
            <div style={{ fontSize: 12, color: accent, display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.5s' }}>
              <span>{EMOTION_EMOJIS[emotion]}</span> {EMOTION_LABELS[emotion]}
              {generating && <span style={{ color: 'var(--muted-fg)' }}>· 📸 bezig...</span>}
            </div>
          </div>

          <div style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 100,
            background: `${accent}15`, border: `1px solid ${accent}33`,
            color: accent, fontWeight: 700,
          }}>
            {bondLevel.emoji} {bondLevel.label}
          </div>
        </header>

        {/* Pinned */}
        {pinnedMsg && (
          <div style={{
            padding: '8px 20px', background: `${accent}0c`, borderBottom: `1px solid ${accent}22`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: accent, fontSize: 13 }}>📌</span>
            <span style={{ fontSize: 13, color: 'var(--fg-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pinnedMsg.content}
            </span>
            <button onClick={() => setPinnedMsg(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', marginBottom: 20, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                border: `2px solid ${accent}44`, fontSize: 36,
                animation: 'breathe 3s ease-in-out infinite',
              }}>
                {companion.avatar_url
                  ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: '50%' }} alt={name} />
                  : '💝'
                }
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Begin je gesprek met {name}</div>
              <div style={{ color: 'var(--muted-fg)', fontSize: 14 }}>Stuur een bericht om te verbinden</div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              accent={accent}
              isHovered={hoveredMsg === msg.id}
              onHover={setHoveredMsg}
              onReply={() => setReplyTo(msg)}
              onPin={() => setPinnedMsg(prev => prev?.id === msg.id ? null : msg)}
              isPinned={pinnedMsg?.id === msg.id}
              onImageClick={setLightboxImg}
              animDelay={idx < 5 ? idx * 0.04 : 0}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply bar */}
        {replyTo && (
          <div style={{
            padding: '10px 20px', background: `${accent}0c`, borderTop: `1px solid ${accent}22`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 3, height: 30, borderRadius: 2, background: accent, flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 1 }}>Reageer op {replyTo.role === 'assistant' ? name : 'jou'}</div>
              <div style={{ fontSize: 13, color: 'var(--muted-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {replyTo.type === 'image' ? '📷 Foto' : replyTo.content}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '12px 16px 14px', borderTop: '1px solid var(--card-border)',
          background: 'rgba(6,6,17,0.85)', backdropFilter: 'blur(24px)', flexShrink: 0,
        }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Stuur ${name} een bericht...`}
              rows={1}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 18, resize: 'none',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${accent}30`,
                color: 'var(--fg)', outline: 'none', fontSize: 15, lineHeight: 1.5,
                transition: 'border-color 0.3s, box-shadow 0.3s',
                maxHeight: 120, fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = `${accent}88`; e.target.style.boxShadow = `0 0 0 3px ${accent}15` }}
              onBlur={e => { e.target.style.borderColor = `${accent}30`; e.target.style.boxShadow = 'none' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: input.trim() && !loading ? `linear-gradient(135deg, ${accent}, #ff6b6b)` : 'var(--muted)',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: input.trim() && !loading ? `0 4px 18px ${accent}44` : 'none',
                transform: input.trim() && !loading ? 'scale(1.05)' : 'scale(0.95)',
              }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'animate-spin-slow 0.7s linear infinite' }} />
                : <span style={{ color: 'white', fontSize: 18, lineHeight: 1 }}>↑</span>
              }
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>
            Enter om te sturen · Shift+Enter voor nieuwe regel
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <button onClick={() => setLightboxImg(null)} style={{
            position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer',
          }}>×</button>
          <img src={lightboxImg} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}
            alt=""
          />
        </div>
      )}
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, accent, isHovered, onHover, onReply, onPin, isPinned, onImageClick, animDelay }: {
  msg: Message; accent: string; isHovered: boolean;
  onHover: (id: string | null) => void; onReply: () => void; onPin: () => void;
  isPinned: boolean; onImageClick: (url: string) => void; animDelay: number;
}) {
  const isUser = msg.role === 'user'
  const isTyping = msg.type === 'typing'
  const isImgLoading = msg.type === 'image_loading'
  const isImage = msg.type === 'image'
  const eColor = EMOTION_COLORS[msg.emotion] || accent

  if (isTyping) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '3px 0' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: `${eColor}18`, border: `1px solid ${eColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
        }}>
          {EMOTION_EMOJIS[msg.emotion] || '💬'}
        </div>
        <div style={{
          padding: '12px 18px', borderRadius: '18px 18px 18px 4px',
          background: 'var(--card)', border: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span className="typing-dot" style={{ color: accent }} />
          <span className="typing-dot" style={{ color: accent }} />
          <span className="typing-dot" style={{ color: accent }} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '3px 0', alignItems: 'flex-end', gap: 8, position: 'relative',
        animation: `${isUser ? 'msg-right' : 'msg-left'} 0.28s cubic-bezier(0.34,1.2,0.64,1) ${animDelay}s both`,
      }}
      onMouseEnter={() => onHover(msg.id)}
      onMouseLeave={() => onHover(null)}
    >
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: `${eColor}18`, border: `1px solid ${eColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, alignSelf: 'flex-end',
        }}>
          {EMOTION_EMOJIS[msg.emotion] || '💬'}
        </div>
      )}

      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {msg.replyTo && (
          <div style={{
            fontSize: 12, color: 'var(--muted-fg)', padding: '5px 10px',
            borderLeft: `2px solid ${accent}`, background: 'var(--muted)', borderRadius: '6px 6px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
          }}>
            {msg.replyTo.content}
          </div>
        )}

        {isImage ? (
          <div onClick={() => onImageClick(msg.content)} style={{
            borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
            border: `1px solid ${accent}30`, maxWidth: 240,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 12px 40px ${accent}33` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)' }}
          >
            <img src={msg.content} style={{ width: '100%', display: 'block' }} alt="foto" />
          </div>
        ) : isImgLoading ? (
          <div style={{
            padding: '11px 16px', borderRadius: '18px 18px 18px 4px',
            background: 'var(--card)', border: `1px solid ${accent}30`,
            color: accent, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${accent}44`, borderTopColor: accent, animation: 'spin-slow 0.8s linear infinite' }} />
            📸 Foto maken...
          </div>
        ) : (
          <div style={{
            padding: '11px 15px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? `linear-gradient(135deg, ${accent}d0, ${accent}a0)` : 'var(--card)',
            border: isUser ? 'none' : '1px solid var(--card-border)',
            fontSize: 15, lineHeight: 1.55, color: 'var(--fg)', wordBreak: 'break-word',
            boxShadow: isUser ? `0 4px 16px ${accent}2a` : 'none',
          }}>
            {msg.content}
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--fg-3)', padding: '0 2px' }}>
          {new Date(msg.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          {isPinned && <span style={{ marginLeft: 4, color: accent }}>📌</span>}
        </div>
      </div>

      {isHovered && !isTyping && !isImgLoading && (
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          ...(isUser ? { left: 0 } : { right: 0 }),
          display: 'flex', gap: 3,
          animation: 'fadeIn 0.15s ease',
        }}>
          {[
            { title: 'Reageer', onClick: onReply, icon: '↩' },
            { title: isPinned ? 'Losmaken' : 'Vastzetten', onClick: onPin, icon: '📌' },
          ].map(b => (
            <button key={b.title} title={b.title} onClick={b.onClick} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--card)', border: '1px solid var(--card-border)',
              fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-2)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-hover)'; e.currentTarget.style.color = 'var(--fg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--fg-2)' }}
            >
              {b.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
