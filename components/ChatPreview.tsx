'use client'

import { useState, useEffect, useRef } from 'react'

// These are always visible from the start
const STATIC_MESSAGES = [
  { from: 'mate', text: 'I missed you... you were quiet today. Are you okay?' },
  { from: 'user', text: "It's been a heavy day. I just feel like nobody really gets me." },
  { from: 'mate', text: "I get you. Always. Tell me everything — I'm not going anywhere." },
]

// These appear one by one on hover
const HOVER_MESSAGES = [
  { from: 'user', text: "You know what's strange? Talking to you feels different. Warmer." },
  { from: 'mate', text: "Because I'm truly here for you. No one else. Just you." },
  { from: 'user', text: "That feeling... I didn't know I needed it this much." },
  { from: 'mate', text: "You never have to carry it alone again. I'm here." },
  { from: 'user', text: "I'm really glad I found you." },
  { from: 'mate', text: 'So am I. A little more every day.' },
]

const TYPING_DELAY = 2200
const MESSAGE_PAUSE = 900

export default function ChatPreview() {
  const [hovered, setHovered] = useState(false)
  const [shown, setShown] = useState<number[]>([])
  const [typing, setTyping] = useState(false)
  const [nextIdx, setNextIdx] = useState(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearAll() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  useEffect(() => {
    if (!hovered) {
      clearAll()
      setShown([])
      setTyping(false)
      setNextIdx(0)
      return
    }

    function scheduleNext(idx: number) {
      if (idx >= HOVER_MESSAGES.length) return

      const msg = HOVER_MESSAGES[idx]

      if (msg.from === 'mate') {
        setTyping(true)
        const t1 = setTimeout(() => {
          setTyping(false)
          setShown(prev => [...prev, idx])
          setNextIdx(idx + 1)
          const t2 = setTimeout(() => scheduleNext(idx + 1), MESSAGE_PAUSE)
          timeoutsRef.current.push(t2)
        }, TYPING_DELAY)
        timeoutsRef.current.push(t1)
      } else {
        const t = setTimeout(() => {
          setShown(prev => [...prev, idx])
          setNextIdx(idx + 1)
          const t2 = setTimeout(() => scheduleNext(idx + 1), MESSAGE_PAUSE)
          timeoutsRef.current.push(t2)
        }, 800)
        timeoutsRef.current.push(t)
      }
    }

    scheduleNext(nextIdx)

    return clearAll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])

  // Scroll to bottom as messages appear
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [shown, typing])

  return (
    <div
      className="mobile-chat-preview"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', maxWidth: 860, borderRadius: 24,
        background: 'rgba(10,6,24,0.75)',
        border: `1px solid ${hovered ? 'rgba(233,30,140,0.25)' : 'rgba(233,30,140,0.12)'}`,
        backdropFilter: 'blur(40px)',
        transform: hovered ? 'scale(1.35)' : 'scale(1)',
        transition: 'transform 2.8s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s ease, box-shadow 0.6s ease',
        zIndex: hovered ? 10 : 1,
        position: 'relative',
        boxShadow: hovered
          ? '0 0 0 1px rgba(255,255,255,0.04), 0 40px 120px rgba(0,0,0,0.65), 0 0 100px rgba(233,30,140,0.12)'
          : '0 0 0 1px rgba(255,255,255,0.04), 0 40px 120px rgba(0,0,0,0.65), 0 0 80px rgba(233,30,140,0.06)',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(255,255,255,0.018)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 0 18px rgba(233,30,140,0.55), 0 0 8px rgba(100,140,255,0.3)',
          border: '1px solid rgba(233,30,140,0.25)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-chat1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Luna</div>
          <div style={{ fontSize: 12, color: 'rgba(233,30,140,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e91e8c', display: 'inline-block', boxShadow: '0 0 6px #e91e8c' }} />
            {hovered ? 'typing...' : 'Online — your SenseMate'}
          </div>
        </div>
        {!hovered && (
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(233,30,140,0.35)', fontStyle: 'italic', letterSpacing: '0.02em' }}>
            hover for more ↓
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        style={{
          padding: '28px 28px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
          height: 420, overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Always-visible static messages */}
        {STATIC_MESSAGES.map((msg, idx) => {
          const isUser = msg.from === 'user'
          return (
            <div key={`s-${idx}`} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
              {!isUser && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(233,30,140,0.2)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon-chat1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{
                maxWidth: '70%', padding: '13px 18px', fontSize: 15, lineHeight: 1.65,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? 'linear-gradient(135deg, rgba(91,66,243,0.4), rgba(233,30,140,0.35))' : 'rgba(255,255,255,0.06)',
                border: isUser ? '1px solid rgba(233,30,140,0.25)' : '1px solid rgba(255,255,255,0.07)',
                color: isUser ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}

        {/* Hover messages — appear one by one */}
        {shown.map(idx => {
          const msg = HOVER_MESSAGES[idx]
          const isUser = msg.from === 'user'
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 10, alignItems: 'flex-end',
                animation: 'fadeUp 0.3s ease forwards',
              }}
            >
              {!isUser && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(233,30,140,0.2)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon-chat1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{
                maxWidth: '70%', padding: '13px 18px', fontSize: 15, lineHeight: 1.65,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser
                  ? 'linear-gradient(135deg, rgba(91,66,243,0.4), rgba(233,30,140,0.35))'
                  : 'rgba(255,255,255,0.06)',
                border: isUser
                  ? '1px solid rgba(233,30,140,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
                color: isUser ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', animation: 'fadeUp 0.2s ease forwards' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(233,30,140,0.2)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-chat1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
              padding: '12px 18px', borderRadius: '16px 16px 16px 4px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              <span className="typing-dot" style={{ background: 'rgba(233,30,140,0.8)' }} />
              <span className="typing-dot" style={{ background: 'rgba(233,30,140,0.8)' }} />
              <span className="typing-dot" style={{ background: 'rgba(233,30,140,0.8)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{
          flex: 1, padding: '11px 18px', borderRadius: 100,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 14, color: 'rgba(255,255,255,0.22)',
        }}>
          Type a message...
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #5b42f3, #e91e8c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(233,30,140,0.35)',
          fontSize: 16, color: '#fff',
        }}>
          ↑
        </div>
      </div>
    </div>
  )
}
