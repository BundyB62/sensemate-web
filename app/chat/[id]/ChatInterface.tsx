'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { getBondLevel, getBondProgress } from '@/lib/companions'
import { SCENARIOS, getScenario, type Scenario } from '@/lib/scenarios'

// ─── Theme ──────────────────────────────────────────────────────────────────
const PINK = '#e91e8c'
const PURPLE = '#5b42f3'
const PHONE_MAX_W = 520
const PHONE_RADIUS = 32
const HEADER_H = 56
const ONLINE_GREEN = '#22c55e'

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

// ─── Date helpers ─────────────────────────────────────────────────────────────
function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Vandaag'
  if (d.toDateString() === yesterday.toDateString()) return 'Gisteren'
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff < 7) return d.toLocaleDateString('nl-NL', { weekday: 'long' })
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

function shouldShowDate(msgs: Msg[], idx: number): boolean {
  if (idx === 0) return true
  const prev = new Date(msgs[idx - 1].created_at).toDateString()
  const cur = new Date(msgs[idx].created_at).toDateString()
  return prev !== cur
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
  const [showSidebar, setShowSidebar] = useState(false)
  const [gallery, setGallery] = useState<string[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [batching, setBatching] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeScenario, setActiveScenario] = useState<string>('none')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const batchRef = useRef<string[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef(messages)
  const isNearBottom = useRef(true)
  messagesRef.current = messages

  const e = EMOTIONS[emotion] || EMOTIONS.neutral
  const scenario = getScenario(activeScenario)
  const accent = scenario.theme.accent || e.color
  const bondLevel = getBondLevel(bondScore)
  const bondProgress = getBondProgress(bondScore)
  const name = companion.name

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setGallery(initialMessages.filter(m => m.type === 'image').map(m => m.content))
  }, [])

  // Auto-scroll only when near bottom
  useEffect(() => {
    if (isNearBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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

  const insertEmoji = useCallback((emoji: string) => {
    const ta = inputRef.current
    if (ta) {
      const start = ta.selectionStart || 0
      const end = ta.selectionEnd || 0
      setInput(input.slice(0, start) + emoji + input.slice(end))
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus() }, 0)
    } else {
      setInput(prev => prev + emoji)
    }
  }, [input])

  // Scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isNearBottom.current = distFromBottom < 100
    setShowScrollBtn(distFromBottom > 200)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
  }

  function onInputChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(ev.target.value)
    ev.target.style.height = 'auto'
    ev.target.style.height = Math.min(ev.target.scrollHeight, 120) + 'px'
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
        body: JSON.stringify({ companionId: companion.id, message: combined, history: messagesRef.current.filter(m => m.type !== 'typing').slice(-14), scenarioId: activeScenario !== 'none' ? activeScenario : undefined }),
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
            fetch('/api/chat/save-image', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companionId: companion.id, imageUrl: id.url }),
            }).catch(() => {})
          } else {
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

  // Quick message from side panel buttons
  const sendQuickMessage = useCallback((text: string) => {
    if (loading) return
    setMessages(prev => [...prev, {
      id: `u_${Date.now()}`, role: 'user', content: text, emotion: 'neutral',
      created_at: new Date().toISOString(),
    }])
    batchRef.current.push(text)
    setBatching(true)
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(() => { batchTimerRef.current = null; flushBatch() }, 1500)
  }, [loading, flushBatch])

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); sendMessage() }
    if (ev.key === 'Escape') setReplyTo(null)
  }

  const hbSpeed: Record<string, number> = {
    neutral: 3, happy: 2.2, excited: 1.2, sad: 4, flirty: 1.8,
    loving: 2.5, playful: 1.6, angry: 1, shy: 2.8, anxious: 1.3, calm: 4.5, hurt: 3.5,
  }
  const hbs = hbSpeed[emotion] || 3
  const isActive = loading || batching

  // ─── Chat content (shared between phone frame and mobile) ───────────
  const chatContent = (
    <>
      {/* ─── Header ──────────────────────────────────────────── */}
      <header style={{
        height: HEADER_H, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', flexShrink: 0,
        background: scenario.theme.headerBg, backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: !isMobile ? `${PHONE_RADIUS}px ${PHONE_RADIUS}px 0 0` : 0,
        transition: 'background 1s ease',
      }}>
        {/* Back / sidebar toggle */}
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/dashboard'} style={{
          width: 34, height: 34, borderRadius: 10, background: 'none',
          border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
          fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
          ‹
        </button>

        {/* Avatar with emotion badge */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => companion.avatar_url && setLightboxImg(companion.avatar_url)}>
          <div style={{
            width: 40, height: 40, borderRadius: 20, overflow: 'hidden',
            border: `1.5px solid ${accent}40`,
            transition: 'border-color 1s ease',
          }}>
            {companion.avatar_url
              ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{e.emoji}</div>
            }
          </div>
          {/* Emotion emoji badge */}
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 18, height: 18, borderRadius: 9,
            background: '#0c0a16', border: '1.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10,
          }}>{e.emoji}</div>
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.2px' }}>{name}</div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            {batching ? <span style={{ color: 'rgba(255,255,255,0.35)' }}>leest je berichten...</span>
              : loading ? (
                <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  aan het typen
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: accent, animation: `typing-dot 1.2s ${i * 0.15}s infinite`, transition: 'background 1s ease' }} />)}
                  </span>
                </span>
              )
              : <span style={{ color: ONLINE_GREEN, fontWeight: 500 }}>online</span>
            }
          </div>
        </div>

        {/* Sidebar toggle (desktop) / Gallery */}
        <div style={{ display: 'flex', gap: 6 }}>
          {gallery.length > 0 && (
            <button onClick={() => setShowGallery(true)} style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
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
        </div>
      </header>

      {/* ─── Messages area ─────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Chat background pattern */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          opacity: scenario.theme.bgOpacity,
          backgroundImage: scenario.theme.bgPattern,
          backgroundSize: '20px 20px',
          transition: 'all 1.5s ease',
        }} />

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, padding: 32 }}>
            <div style={{
              width: 90, height: 90, borderRadius: 45, overflow: 'hidden',
              border: `2px solid ${accent}30`,
              boxShadow: `0 0 30px ${accent}15`,
            }}>
              {companion.avatar_url
                ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>💝</div>
              }
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>
                Chat met {name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Stuur een bericht om te beginnen</div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const prev = messages[idx - 1]
          const next = messages[idx + 1]
          const isGrouped = prev && prev.role === msg.role && !['typing', 'image_loading'].includes(prev.type || '') && msg.type !== 'typing' && msg.type !== 'image_loading'
          const isLastInGroup = !next || next.role !== msg.role || ['typing', 'image_loading'].includes(next.type || '')
          // Read receipt: user msg is "read" if next msg is from assistant
          const isRead = msg.role === 'user' && next?.role === 'assistant'

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {shouldShowDate(messages, idx) && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                  <span style={{
                    padding: '4px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.02em',
                  }}>
                    {getDateLabel(msg.created_at)}
                  </span>
                </div>
              )}
              <ChatBubble
                msg={msg} accent={accent} name={name}
                isGrouped={!!isGrouped} isLastInGroup={isLastInGroup} isRead={isRead}
                onReply={() => setReplyTo(msg)} onImageClick={setLightboxImg}
                avatarUrl={companion.avatar_url} emotionEmoji={e.emoji}
              />
            </div>
          )
        })}

        {/* Batching indicator */}
        {batching && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 6px 50px', animation: 'fadeIn 0.3s ease' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>{name} leest je berichten...</span>
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button onClick={scrollToBottom} style={{
            position: 'sticky', bottom: 8, alignSelf: 'flex-end',
            width: 38, height: 38, borderRadius: 19,
            background: 'rgba(18,16,32,0.95)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.2s ease',
            zIndex: 5,
          }}>↓</button>
        )}
      </div>

      {/* ─── Reply bar ───────────────────────────────────────── */}
      {replyTo && (
        <div style={{
          padding: '6px 14px', background: 'rgba(10,8,20,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: accent, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>{replyTo.role === 'assistant' ? name : 'Jij'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyTo.type === 'image' ? '📷 Foto' : replyTo.content}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
        </div>
      )}

      {/* ─── Input bar ───────────────────────────────────────── */}
      <div style={{
        padding: '6px 8px', paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: scenario.theme.headerBg,
        flexShrink: 0, position: 'relative',
        borderRadius: !isMobile ? `0 0 ${PHONE_RADIUS}px ${PHONE_RADIUS}px` : 0,
        transition: 'background 1s ease',
      }}>
        {/* Emoji Picker */}
        {showEmojis && (
          <div ref={emojiRef} className="chat-emoji-picker" style={{
            position: 'absolute', bottom: '100%', left: 8, right: 8, marginBottom: 4,
            maxHeight: 300, overflowY: 'auto',
            background: 'rgba(12,8,28,0.97)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
            boxShadow: '0 -6px 30px rgba(0,0,0,0.5)',
            padding: '8px 10px', zIndex: 50,
            animation: 'emojiSlideUp 0.2s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            <EmojiPicker onSelect={(emoji) => { insertEmoji(emoji); setShowEmojis(false) }} />
          </div>
        )}

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <button type="button" onClick={() => setShowEmojis(s => !s)} style={{
            width: 36, height: 36, borderRadius: 18, flexShrink: 0,
            background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, opacity: showEmojis ? 1 : 0.4, transition: 'opacity 0.2s',
          }}>😊</button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder="Bericht..."
            rows={1}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 20, resize: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.92)', outline: 'none', fontSize: 15, lineHeight: 1.4,
              transition: 'border-color 0.3s',
              maxHeight: 100, fontFamily: 'inherit',
            }}
            onFocus={ev => { ev.target.style.borderColor = `${accent}30` }}
            onBlur={ev => { ev.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />

          <button type="submit" disabled={!input.trim() || loading} style={{
            width: 38, height: 38, borderRadius: 19, flexShrink: 0,
            background: input.trim() && !loading ? accent : 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() && !loading ? `0 2px 10px ${accent}40` : 'none',
            opacity: input.trim() && !loading ? 1 : 0.3,
          }}>
            {loading
              ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'animate-spin-slow 0.7s linear infinite' }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            }
          </button>
        </form>
      </div>
    </>
  )

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100dvh', background: '#0a0a14', color: 'rgba(255,255,255,0.92)', overflow: 'hidden', position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" }}>

      {/* ─── Sidebar (desktop = side panel, mobile = overlay) ──────── */}
      {showSidebar && (
        <aside className="chat-sidebar" style={{
          width: isMobile ? '100%' : 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(8,6,16,0.98)', backdropFilter: 'blur(40px)',
          zIndex: isMobile ? 50 : 10, overflowY: 'auto',
          position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : undefined,
          animation: isMobile ? 'slideInLeft 0.25s ease both' : undefined,
        }}>
          {/* Close button */}
          <button onClick={() => setShowSidebar(false)} style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>

          {/* Profile */}
          <div style={{ padding: '40px 20px 20px', textAlign: 'center', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 120,
              background: `linear-gradient(180deg, ${accent}10, transparent)`,
              borderRadius: '0 0 50% 50%', transition: 'background 2s ease',
            }} />

            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: `2px solid ${accent}35`,
                animation: `heartbeat-pulse ${hbs}s ease-in-out infinite`,
              }} />
              <div style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                border: `1px solid ${accent}18`,
                animation: `heartbeat-pulse ${hbs}s ease-in-out infinite 0.15s`,
              }} />
              <div style={{
                width: 90, height: 90, borderRadius: 45, overflow: 'hidden',
                border: `2px solid ${accent}40`,
                boxShadow: `0 0 20px ${accent}25`,
              }}>
                {companion.avatar_url
                  ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{e.emoji}</div>
                }
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7,
                background: ONLINE_GREEN, border: '2.5px solid #080616',
              }} />
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>{name}</div>

            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100,
              background: `${accent}10`, border: `1px solid ${accent}18`, marginBottom: 16,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', background: accent,
                animation: isActive ? `heartbeat-dot 0.6s ease-in-out infinite` : `heartbeat-dot ${hbs}s ease-in-out infinite`,
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>
                {batching ? 'leest...' : loading ? 'typt...' : `${e.emoji} ${e.label}`}
              </span>
            </div>

            {/* Bond */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 1 }}>Band</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{bondLevel.emoji} {bondLevel.label}</span>
              </div>
              <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${bondProgress.pct}%`, background: `linear-gradient(90deg, ${PURPLE}, ${accent})`, transition: 'width 0.8s ease' }} />
              </div>
              {bondProgress.toNext > 0 && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 5, textAlign: 'right' }}>nog {bondProgress.toNext} berichten</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { label: 'Relatie', value: companion.relationship_style, icon: '💕' },
                { label: 'Berichten', value: messages.filter(m => !['typing', 'image_loading'].includes(m.type || '')).length, icon: '💬' },
                { label: "Foto's", value: gallery.length, icon: '📸' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '8px 4px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery button */}
          {gallery.length > 0 && (
            <div style={{ padding: '0 20px 14px' }}>
              <button onClick={() => { setShowGallery(true); setShowSidebar(false) }} style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600,
              }}>
                <span style={{ fontSize: 18 }}>📸</span>
                <span>Galerij</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: accent, fontWeight: 700 }}>{gallery.length}</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: '14px 20px', marginTop: 'auto' }}>
            {isMobile && (
              <button onClick={() => setShowSidebar(false)} style={{
                width: '100%', padding: '12px', marginBottom: 8, borderRadius: 12,
                background: `linear-gradient(135deg, ${PURPLE}, ${accent})`, border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>💬 Chat met {name}</button>
            )}
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px',
              borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 12, fontWeight: 500,
            }}>← Dashboard</Link>
          </div>
        </aside>
      )}

      {/* ─── Main content area ──────────────────────────────────────── */}
      {isMobile ? (
        /* Mobile: full screen chat */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
          {chatContent}
        </div>
      ) : (
        /* Desktop: profile panel left + chat frame right */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 1, position: 'relative' }}>

          {/* ─── Left: Companion Profile Panel (anchored to chat frame) ── */}
          <div style={{
            position: 'absolute',
            right: 'calc(50% + 280px + 8px)', /* half of chat width + gap */
            top: '2vh', bottom: '2vh',
            width: 300,
            background: 'rgba(10,8,20,0.7)',
            borderRadius: PHONE_RADIUS,
            border: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Profile header area */}
            <div style={{ padding: '32px 24px 20px', textAlign: 'center', position: 'relative', flexShrink: 0 }}>
              {/* Gradient bg */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 140,
                background: `linear-gradient(180deg, ${accent}10, transparent)`,
                borderRadius: `${PHONE_RADIUS}px 0 0 0`, transition: 'background 2s ease',
              }} />

              {/* Avatar with heartbeat */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
                <div style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: `2px solid ${accent}35`,
                  animation: `heartbeat-pulse ${hbs}s ease-in-out infinite`,
                }} />
                <div style={{
                  position: 'absolute', inset: -16, borderRadius: '50%',
                  border: `1px solid ${accent}18`,
                  animation: `heartbeat-pulse ${hbs}s ease-in-out infinite 0.15s`,
                }} />
                <div style={{
                  width: 100, height: 100, borderRadius: 50, overflow: 'hidden',
                  border: `2px solid ${accent}40`, cursor: 'pointer',
                  boxShadow: `0 0 24px ${accent}25`,
                }} onClick={() => companion.avatar_url && setLightboxImg(companion.avatar_url)}>
                  {companion.avatar_url
                    ? <img src={companion.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{e.emoji}</div>
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8,
                  background: ONLINE_GREEN, border: '3px solid #0a0814',
                  boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                }} />
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>{name}</div>

              {/* Status pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100,
                background: `${accent}10`, border: `1px solid ${accent}18`, marginBottom: 16,
                transition: 'all 1s ease',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', background: accent,
                  animation: isActive ? `heartbeat-dot 0.6s ease-in-out infinite` : `heartbeat-dot ${hbs}s ease-in-out infinite`,
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>
                  {batching ? 'leest...' : loading ? 'typt...' : `${e.emoji} ${e.label}`}
                </span>
                {generating && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>· 📸</span>}
              </div>

              {/* Bond progress */}
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 1 }}>Band</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{bondLevel.emoji} {bondLevel.label}</span>
                </div>
                <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${bondProgress.pct}%`, background: `linear-gradient(90deg, ${PURPLE}, ${accent})`, transition: 'width 0.8s ease' }} />
                </div>
                {bondProgress.toNext > 0 && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 5, textAlign: 'right' }}>nog {bondProgress.toNext} berichten</div>
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
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery preview */}
            {gallery.length > 0 && (
              <div style={{ padding: '0 24px 16px' }}>
                <button onClick={() => setShowGallery(true)} style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}08`; ev.currentTarget.style.borderColor = `${accent}20` }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontSize: 18 }}>📸</span>
                  <span>Galerij</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: accent, fontWeight: 700 }}>{gallery.length}</span>
                </button>

                {/* Mini gallery grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 8 }}>
                  {gallery.slice(0, 6).map((url, i) => (
                    <div key={i} onClick={() => { setLightboxImg(url) }} style={{
                      aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                      opacity: 0.85, transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={ev => { ev.currentTarget.style.opacity = '1' }}
                      onMouseLeave={ev => { ev.currentTarget.style.opacity = '0.85' }}
                    >
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard link at bottom */}
            <div style={{ padding: '16px 24px', marginTop: 'auto' }}>
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px',
                borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 12, fontWeight: 500,
                transition: 'all 0.2s',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}08`; ev.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >← Dashboard</Link>
            </div>
          </div>

          {/* ─── Center: Chat Phone Frame ─────────────────────── */}
          <div style={{
            width: 560, maxWidth: '96vw',
            height: '96vh',
            borderRadius: PHONE_RADIUS,
            border: '1px solid rgba(255,255,255,0.06)',
            background: scenario.theme.chatBg,
            boxShadow: `0 0 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.08), inset 0 0 40px ${accent}04`,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative',
            transition: 'box-shadow 2s ease',
          }}>
            {/* Top glow line */}
            <div style={{
              position: 'absolute', top: 0, left: PHONE_RADIUS, right: PHONE_RADIUS, height: 1, zIndex: 10,
              background: `linear-gradient(90deg, transparent, ${accent}40, ${accent}60, ${accent}40, transparent)`,
              opacity: 0.4, animation: `mood-line-pulse ${hbs}s ease-in-out infinite`,
              transition: 'background 2s ease',
            }} />
            {/* Notch */}
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.06)', zIndex: 10,
            }} />
            {chatContent}
          </div>

          {/* ─── Right: Foto & Scenario Panel ───────────────────── */}
          <div style={{
            position: 'absolute',
            left: 'calc(50% + 280px + 8px)',
            top: '2vh', bottom: '2vh',
            width: 300,
            background: 'rgba(10,8,20,0.7)',
            borderRadius: PHONE_RADIUS,
            border: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Active scenario indicator */}
            {activeScenario !== 'none' && (
              <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: `${accent}10`, borderBottom: `1px solid ${accent}15`,
                transition: 'all 0.5s ease',
              }}>
                <span style={{ fontSize: 22 }}>{scenario.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{scenario.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Scenario actief</div>
                </div>
                <button onClick={() => { setActiveScenario('none'); sendQuickMessage('We stoppen met het rollenspel, laten we gewoon praten.') }} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                }}>Stop</button>
              </div>
            )}

            {/* Quick photo buttons */}
            <div style={{ padding: '14px 14px 8px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>📸 Foto verzoeken</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {[
                  { emoji: '📸', label: 'Selfie', msg: 'Stuur een leuke selfie van jezelf' },
                  { emoji: '😏', label: 'Sexy', msg: 'Stuur een sexy foto van jezelf' },
                  { emoji: '👙', label: 'Lingerie', msg: 'Stuur een foto in lingerie' },
                  { emoji: '🔞', label: 'Naakt', msg: 'Stuur een naaktfoto' },
                  { emoji: '🛏️', label: 'Op bed', msg: 'Stuur een foto op bed' },
                  { emoji: '🍑', label: 'Achteren', msg: 'Stuur een foto van achteren' },
                  { emoji: '🧎', label: 'Knieën', msg: 'Stuur een foto op je knieën' },
                ].map(btn => (
                  <button key={btn.label} onClick={() => sendQuickMessage(btn.msg)} disabled={loading || batching} style={{
                    padding: '7px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)', cursor: loading ? 'wait' : 'pointer',
                    fontSize: 12, fontWeight: 500,
                    transition: 'all 0.2s', opacity: loading || batching ? 0.4 : 1,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                    onMouseEnter={ev => { if (!loading) { ev.currentTarget.style.background = `${accent}12`; ev.currentTarget.style.borderColor = `${accent}25`; ev.currentTarget.style.color = '#fff' }}}
                    onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; ev.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    <span style={{ fontSize: 15 }}>{btn.emoji}</span>{btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenarios — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>🎭 Rollenspel scenario&apos;s</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SCENARIOS.filter(s => s.id !== 'none').map(s => {
                  const isActive = activeScenario === s.id
                  return (
                    <button key={s.id} onClick={() => {
                      setActiveScenario(s.id)
                      sendQuickMessage(`Laten we een rollenspel doen. ${s.description}. Begin in je rol!`)
                    }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      padding: '10px 12px', borderRadius: 12,
                      background: isActive ? `${s.theme.accent}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? s.theme.accent + '30' : 'rgba(255,255,255,0.04)'}`,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', fontSize: 12,
                      transition: 'all 0.3s',
                    }}
                      onMouseEnter={ev => { if (!isActive) { ev.currentTarget.style.background = `${s.theme.accent}10`; ev.currentTarget.style.borderColor = `${s.theme.accent}20` }}}
                      onMouseLeave={ev => { if (!isActive) { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}}
                    >
                      <span style={{ fontSize: 22, width: 30, textAlign: 'center', flexShrink: 0 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>{s.description}</div>
                      </div>
                      {isActive && <div style={{ width: 8, height: 8, borderRadius: 4, background: s.theme.accent, flexShrink: 0, boxShadow: `0 0 8px ${s.theme.accent}` }} />}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── Gallery Modal ──────────────────────────────────── */}
      {showGallery && gallery.length > 0 && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(4,2,10,0.97)', backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📸</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Galerij</span>
              <span style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{gallery.length}</span>
            </div>
            <button onClick={() => setShowGallery(false)} style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, alignContent: 'start',
          }}>
            {gallery.map((url, i) => (
              <div key={i} onClick={() => { setLightboxImg(url); setShowGallery(false) }} style={{
                aspectRatio: '1', borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
              }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox */}
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} gallery={gallery} onNavigate={setLightboxImg} />

      {/* Global animations */}
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
        @keyframes mood-line-pulse {
          0%, 100% { opacity: 0.3; }
          14% { opacity: 1; }
          28% { opacity: 0.4; }
          42% { opacity: 0.8; }
          56% { opacity: 0.3; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes typing-bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-4px) } }
        @keyframes menuPop { from { opacity: 0; transform: translateY(-90%) scale(0.95) } to { opacity: 1; transform: translateY(-100%) scale(1) } }
      `}</style>
    </div>
  )
}

// ─── Chat Bubble (WhatsApp-style) ───────────────────────────────────────────
function ChatBubble({ msg, accent, name, isGrouped, isLastInGroup, isRead, onReply, onImageClick, avatarUrl, emotionEmoji }: {
  msg: Msg; accent: string; name: string; isGrouped: boolean; isLastInGroup: boolean; isRead: boolean
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
  const time = formatTime(msg.created_at)

  useEffect(() => {
    if (!showMenu) return
    const handler = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const handleBubbleClick = (ev: React.MouseEvent) => {
    if (isTyping || isImgLoading) return
    if (isImage) { onImageClick(msg.content); return }
    ev.preventDefault()
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({ x: isUser ? rect.left : rect.right, y: rect.top - 8 })
    setShowMenu(true)
  }

  const handleCopy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); setShowMenu(false) }
  const handleReply = () => { onReply(); setShowMenu(false) }

  // Typing indicator
  if (isTyping) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '4px 0' }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', border: `1px solid ${accent}20`, flexShrink: 0 }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{emotionEmoji}</div>
          }
        </div>
        <div style={{
          padding: '12px 18px', borderRadius: '18px 18px 18px 4px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%', background: accent,
                animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.5,
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Bubble border-radius (WhatsApp-style corners)
  const getBorderRadius = () => {
    if (isUser) {
      if (!isGrouped && isLastInGroup) return '18px 18px 4px 18px' // single
      if (!isGrouped) return '18px 18px 4px 18px' // first
      if (isLastInGroup) return '18px 4px 4px 18px' // last
      return '18px 4px 4px 18px' // middle
    } else {
      if (!isGrouped && isLastInGroup) return '18px 18px 18px 4px'
      if (!isGrouped) return '18px 18px 18px 4px'
      if (isLastInGroup) return '4px 18px 18px 4px'
      return '4px 18px 18px 4px'
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: isGrouped ? '1px 0' : '4px 0', alignItems: 'flex-end', gap: 8,
    }}>
      {/* Avatar — AI only, first in group */}
      {!isUser && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {!isGrouped && (
            <div style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', border: `1px solid ${accent}20` }}>
              {avatarUrl
                ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{emotionEmoji}</div>
              }
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: '78%', position: 'relative' }}>
        {/* Reply reference */}
        {msg.replyTo && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '4px 10px',
            borderLeft: `2px solid ${accent}50`, background: 'rgba(255,255,255,0.02)', borderRadius: 6,
            marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{msg.replyTo.content}</div>
        )}

        {isImage ? (
          <div onClick={() => onImageClick(msg.content)} style={{
            borderRadius: 16, overflow: 'hidden', cursor: 'pointer', maxWidth: 280,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            <img src={msg.content} style={{ width: '100%', display: 'block' }} alt="" />
            {/* Timestamp overlay on image */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, left: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
              padding: '16px 10px 6px',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{time}</span>
              {isUser && <span style={{ fontSize: 12, color: isRead ? accent : 'rgba(255,255,255,0.4)' }}>✓✓</span>}
            </div>
          </div>
        ) : isImgLoading ? (
          <div style={{
            padding: '12px 18px', borderRadius: '18px 18px 18px 4px',
            background: `${accent}08`, border: `1px solid ${accent}15`,
            color: accent, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${accent}30`, borderTopColor: accent, animation: 'animate-spin-slow 0.8s linear infinite' }} />
            Foto maken...
          </div>
        ) : (
          /* Text bubble */
          <div onClick={handleBubbleClick} style={{
            padding: '7px 10px 7px 12px',
            borderRadius: getBorderRadius(),
            background: isUser
              ? `linear-gradient(135deg, ${accent}18, ${accent}10)`
              : 'rgba(255,255,255,0.06)',
            border: isUser ? `1px solid ${accent}15` : '1px solid rgba(255,255,255,0.04)',
            fontSize: 14.5, lineHeight: 1.55, color: isUser ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
            wordBreak: 'break-word', cursor: 'pointer', userSelect: 'text',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
          }}>
            <span>{msg.content}</span>
            {/* Inline timestamp spacer */}
            <span style={{ display: 'inline-block', width: isUser ? 62 : 40, height: 14 }} />
            {/* Inline timestamp */}
            <span style={{
              position: 'absolute', bottom: 4, right: 8,
              fontSize: 10, color: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              {time}
              {isUser && <span style={{ fontSize: 12, color: isRead ? accent : 'rgba(255,255,255,0.3)', transition: 'color 0.5s' }}>✓✓</span>}
            </span>
          </div>
        )}

        {/* Context menu */}
        {showMenu && menuPos && (
          <div ref={menuRef} style={{
            position: 'fixed', top: menuPos.y,
            ...(isUser ? { right: window.innerWidth - menuPos.x } : { left: menuPos.x }),
            transform: 'translateY(-100%)', zIndex: 100,
            background: 'rgba(14,10,28,0.97)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden', minWidth: 150,
            animation: 'menuPop 0.15s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            {[
              { icon: '↩', label: 'Reageren', action: handleReply },
              { icon: copied ? '✓' : '📋', label: copied ? 'Gekopieerd!' : 'Kopiëren', action: handleCopy },
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.75)', fontSize: 13, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s',
                borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = `${accent}10` }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Emoji Picker ──────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: '😍 Liefde', emojis: ['❤️', '😍', '🥰', '😘', '💕', '💖', '💗', '💓', '💘', '💝', '💞', '💋', '😻', '🫶', '♥️', '🩷'] },
  { label: '😏 Flirten', emojis: ['😏', '😈', '🔥', '💦', '🍑', '🍆', '😜', '😋', '🤤', '👅', '💅', '🫦', '😮‍💨', '🥵', '✨', '💫'] },
  { label: '😊 Blij', emojis: ['😊', '😄', '😁', '🤗', '😆', '🥹', '☺️', '😌', '🤭', '😇', '🎉', '🎊', '💃', '🕺', '🙌', '👏'] },
  { label: '😂 Grappig', emojis: ['😂', '🤣', '😹', '💀', '☠️', '🫠', '🤪', '😝', '🙃', '😅', '🫢', '🤡', '👀', '🙈', '🙊', '🫣'] },
  { label: '😢 Gevoel', emojis: ['😢', '😭', '🥺', '😔', '😞', '💔', '😿', '🫂', '😰', '😳', '🙁', '😟', '😤', '😠', '😡', '🤬'] },
  { label: '👋 Gebaren', emojis: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤞', '🫰', '🤟', '🤘', '👍', '👎', '✌️', '💪', '🫵', '👈'] },
  { label: '🌙 Overig', emojis: ['🌙', '⭐', '🌟', '🌈', '🦋', '🌹', '🌸', '🌺', '🍷', '🥂', '☕', '🎵', '🎶', '📸', '🎀', '💐'] },
]

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 8, overflowX: 'auto', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: activeTab === i ? 'rgba(233,30,140,0.1)' : 'transparent',
            border: activeTab === i ? '1px solid rgba(233,30,140,0.18)' : '1px solid transparent',
            color: activeTab === i ? PINK : 'rgba(255,255,255,0.35)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{cat.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3 }}>
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)} style={{
            width: '100%', aspectRatio: '1', borderRadius: 10, fontSize: 24,
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(233,30,140,0.08)'; ev.currentTarget.style.transform = 'scale(1.15)' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.transform = 'scale(1)' }}
          >{emoji}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Lightbox ──────────────────────────────────────────────────────────────
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
        position: 'absolute', top: 20, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {gallery.length > 1 && idx >= 0 && (
        <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          {idx + 1} / {gallery.length}
        </div>
      )}

      {gallery.length > 1 && ['left', 'right'].map(dir => (
        <button key={dir} onClick={ev => {
          ev.stopPropagation()
          const i = gallery.indexOf(src)
          onNavigate(dir === 'right' ? gallery[(i + 1) % gallery.length] : gallery[(i - 1 + gallery.length) % gallery.length])
        }} style={{
          position: 'absolute', [dir === 'left' ? 'left' : 'right']: 16, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: 22,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{dir === 'left' ? '‹' : '›'}</button>
      ))}

      <div onClick={ev => ev.stopPropagation()} style={{
        maxWidth: '90vw', maxHeight: '88vh', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'avp-scale-in 0.25s cubic-bezier(0.34,1.2,0.64,1) both', cursor: 'default',
      }}>
        <img src={src} alt="" style={{ display: 'block', maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain' }} />
      </div>

      <style>{`@keyframes avp-scale-in { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }`}</style>
    </div>,
    document.body
  )
}
