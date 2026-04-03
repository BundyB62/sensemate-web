'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EMOTION_COLORS: Record<string, string> = {
  neutral: '#8888aa',
  happy: '#FFD700',
  excited: '#FF6B35',
  sad: '#6B8CFF',
  flirty: '#FF3D9A',
  loving: '#FF6B9D',
  playful: '#A78BFA',
  angry: '#EF4444',
}

const EMOTION_EMOJIS: Record<string, string> = {
  neutral: '😐',
  happy: '😊',
  excited: '🤩',
  sad: '😢',
  flirty: '😏',
  loving: '🥰',
  playful: '😄',
  angry: '😠',
}

export default function ChatInterface({ companion, initialMessages }: { companion: any, initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [emotion, setEmotion] = useState('neutral')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const emotionColor = EMOTION_COLORS[emotion] || '#8888aa'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Optimistic update
    const tempId = Date.now().toString()
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'user',
      content: userMessage,
      emotion: 'neutral',
      created_at: new Date().toISOString(),
    }])

    // Add typing indicator
    setMessages(prev => [...prev, {
      id: 'typing',
      role: 'assistant',
      content: '...',
      emotion: 'neutral',
      type: 'typing',
      created_at: new Date().toISOString(),
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: companion.id,
          message: userMessage,
          history: messages.slice(-10),
        }),
      })

      const data = await res.json()

      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: data.text || 'Hmm...',
        emotion: data.emotion || 'neutral',
        created_at: new Date().toISOString(),
      }))

      setEmotion(data.emotion || 'neutral')
    } catch {
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--card-border)', background: 'var(--card)' }}>
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-xl">←</Link>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${emotionColor}44, ${emotionColor}22)`, border: `2px solid ${emotionColor}66` }}>
            {companion.avatar_url ? (
              <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover" />
            ) : <span className="text-xl">{EMOTION_EMOJIS[emotion]}</span>}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: '#22c55e', borderColor: 'var(--card)' }} />
        </div>

        <div className="flex-1">
          <div className="font-semibold">{companion.name}</div>
          <div className="text-xs capitalize" style={{ color: emotionColor }}>
            {EMOTION_EMOJIS[emotion]} {emotion === 'neutral' ? 'Online' : emotion}
          </div>
        </div>

        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
          Dashboard
        </Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">{EMOTION_EMOJIS[emotion]}</div>
            <p className="text-gray-400 text-sm">Begin een gesprek met {companion.name}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end" style={{ background: `linear-gradient(135deg, ${emotionColor}33, ${emotionColor}11)`, border: `1px solid ${emotionColor}44` }}>
                <span className="text-sm">{EMOTION_EMOJIS[msg.emotion] || '😊'}</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'typing' ? 'animate-pulse' : ''}`}
              style={{
                background: msg.role === 'user'
                  ? `linear-gradient(135deg, ${emotionColor}cc, ${emotionColor}99)`
                  : 'var(--card)',
                border: msg.role === 'assistant' ? '1px solid var(--card-border)' : 'none',
                color: 'var(--foreground)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--card-border)', background: 'var(--card)' }}>
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Stuur ${companion.name} een bericht...`}
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl text-white placeholder-gray-500 outline-none resize-none"
            style={{ background: 'var(--muted)', border: `1px solid ${emotionColor}33`, maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${emotionColor}, #ff6b6b)` }}
          >
            <span className="text-white text-lg">↑</span>
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-2">Enter om te sturen • Shift+Enter voor nieuwe regel</p>
      </div>
    </div>
  )
}
