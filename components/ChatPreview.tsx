'use client'
import { useState, useEffect, useRef } from 'react'

// Animated chat preview — messages appear one by one with typing effect
const CHAT_SCRIPT: { side: 'left' | 'right'; text: string; delay: number; photo?: boolean }[] = [
  { side: 'left', text: 'Hey you... I was just thinking about you 😏', delay: 1200 },
  { side: 'right', text: 'Oh really? What were you thinking? 🔥', delay: 3000 },
  { side: 'left', text: 'That you might want to see something special 😘', delay: 3200 },
  { side: 'right', text: 'Send me a sexy photo 😍', delay: 2800 },
  { side: 'left', text: 'Anything for you babe... 💋', delay: 2500 },
  { side: 'left', text: '', delay: 0, photo: true },
]

export default function ChatPreview() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const [typingSide, setTypingSide] = useState<'left' | 'right'>('left')
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Start animation when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [started])

  // Play messages one by one
  useEffect(() => {
    if (!started || visibleCount >= CHAT_SCRIPT.length) return

    const next = CHAT_SCRIPT[visibleCount]
    const typingDuration = next.photo ? 3500 : 1800

    // Show typing indicator
    setTypingSide(next.side)
    setTyping(true)

    const t1 = setTimeout(() => {
      setTyping(false)
      setVisibleCount(v => v + 1)

      // Scroll down
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }, typingDuration)

    return () => clearTimeout(t1)
  }, [started, visibleCount])

  // Auto-scroll when messages appear
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleCount, typing])

  // Replay after all messages shown
  useEffect(() => {
    if (visibleCount >= CHAT_SCRIPT.length) {
      const t = setTimeout(() => {
        setVisibleCount(0)
        setStarted(false)
        setTimeout(() => setStarted(true), 500)
      }, 6000)
      return () => clearTimeout(t)
    }
  }, [visibleCount])

  return (
    <div ref={sectionRef} style={{
      width: '100%', maxWidth: 1000, margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48,
    }} className="mobile-chat-preview">

      {/* Left: Feature highlights */}
      <div style={{ flex: 1, maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            See it in action
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            A real chat experience with your AI companion. Photos, roleplay, and conversations that feel genuine.
          </p>
        </div>
        {[
          { icon: '💬', title: 'Natural conversations', desc: 'She texts like a real person — short, flirty, with emoji. Any language.' },
          { icon: '📸', title: 'Photos on demand', desc: 'Ask for any photo — selfie, lingerie, or a custom scenario. Generated in seconds.' },
          { icon: '🎭', title: 'Roleplay with one click', desc: 'Nurse, secretary, stewardess — 12 built-in scenarios.' },
          { icon: '✓✓', title: 'Feels like WhatsApp', desc: 'Read receipts, typing indicators, timestamps — just like real messaging.' },
        ].map(f => (
          <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Animated phone mockup */}
      <div style={{
        width: 340, flexShrink: 0,
        borderRadius: 36, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0b0b16',
        boxShadow: '0 30px 100px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.1), 0 0 60px rgba(233,30,140,0.08)',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', zIndex: 5 }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(233,30,140,0.5), transparent)', zIndex: 5 }} />

        {/* Header */}
        <div style={{
          height: 54, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          background: 'rgba(12,10,22,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '36px 36px 0 0',
        }}>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', marginRight: -2 }}>‹</div>
          <div style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', border: '1.5px solid rgba(233,30,140,0.35)', background: 'linear-gradient(135deg, #5b42f3, #e91e8c)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, background: '#0c0a16', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>😏</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Luna</div>
            <div style={{ fontSize: 10, color: typing && typingSide === 'left' ? 'rgba(255,255,255,0.4)' : '#22c55e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              {typing && typingSide === 'left' ? (
                <>typing<span style={{ display: 'flex', gap: 2, marginLeft: 2 }}>{[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `landingTypingDot 1s ${i * 0.15}s infinite` }} />)}</span></>
              ) : 'online'}
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>📸</div>
        </div>

        {/* Messages */}
        <div ref={containerRef} style={{ padding: '10px 10px 6px', display: 'flex', flexDirection: 'column', gap: 4, height: 520, overflowY: 'hidden' }}>
          {/* Date */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 6px' }}>
            <span style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>Today</span>
          </div>

          {/* Rendered messages */}
          {CHAT_SCRIPT.slice(0, visibleCount).map((msg, i) => {
            if (msg.photo) {
              return (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end', animation: 'lpMsgIn 0.3s ease both' }}>
                  <div style={{ width: 24 }} />
                  <div style={{ width: '80%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(233,30,140,0.1)', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/landing-chat-preview.jpg" alt="" style={{ width: '100%', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', padding: '14px 8px 4px', display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>14:25</span>
                    </div>
                  </div>
                </div>
              )
            }
            return <Bubble key={i} side={msg.side} text={msg.text} time={`14:${22 + i}`} read={msg.side === 'right'} />
          })}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: typingSide === 'right' ? 'flex-end' : 'flex-start', animation: 'lpMsgIn 0.2s ease both' }}>
              {typingSide === 'left' && <div style={{ width: 24, height: 24, borderRadius: 12, background: 'linear-gradient(135deg, #5b42f3, #e91e8c)', flexShrink: 0 }} />}
              <div style={{
                padding: '10px 16px',
                borderRadius: typingSide === 'left' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                background: typingSide === 'left' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(233,30,140,0.14), rgba(233,30,140,0.08))',
                border: typingSide === 'right' ? '1px solid rgba(233,30,140,0.1)' : 'none',
                display: 'flex', gap: 4,
              }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: typingSide === 'left' ? '#e91e8c' : 'rgba(255,255,255,0.5)', opacity: 0.5, animation: `landingTypingDot 1s ${i * 0.15}s infinite` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: '6px 8px 12px', background: 'rgba(12,10,22,0.98)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6, alignItems: 'center', borderRadius: '0 0 36px 36px' }}>
          <div style={{ fontSize: 16, opacity: 0.3, padding: '0 4px' }}>😊</div>
          <div style={{ flex: 1, padding: '7px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>Message...</div>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>

        <style>{`
          @keyframes lpMsgIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes landingTypingDot { 0%,60%,100% { transform: translateY(0); opacity: 0.4 } 30% { transform: translateY(-3px); opacity: 1 } }
        `}</style>
      </div>
    </div>
  )
}

function Bubble({ side, text, time, read }: { side: 'left' | 'right'; text: string; time: string; read?: boolean }) {
  const isUser = side === 'right'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 6, alignItems: 'flex-end', animation: 'lpMsgIn 0.3s ease both' }}>
      {!isUser && <div style={{ width: 24, height: 24, borderRadius: 12, background: 'linear-gradient(135deg, #5b42f3, #e91e8c)', flexShrink: 0 }} />}
      <div style={{
        padding: '6px 9px', maxWidth: '72%',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'linear-gradient(135deg, rgba(233,30,140,0.14), rgba(233,30,140,0.08))' : 'rgba(255,255,255,0.05)',
        border: isUser ? '1px solid rgba(233,30,140,0.1)' : '1px solid rgba(255,255,255,0.03)',
        fontSize: 12, lineHeight: 1.45, color: isUser ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
        position: 'relative',
      }}>
        {text}
        <span style={{ display: 'inline-block', width: isUser ? 48 : 30, height: 10 }} />
        <span style={{ position: 'absolute', bottom: 3, right: 7, fontSize: 8, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 2 }}>
          {time}
          {isUser && <span style={{ fontSize: 10, color: read ? '#e91e8c' : 'rgba(255,255,255,0.2)' }}>✓✓</span>}
        </span>
      </div>
    </div>
  )
}
