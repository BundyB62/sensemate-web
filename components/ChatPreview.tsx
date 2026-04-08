'use client'

// Realistic mockup of the actual chat interface for the landing page
export default function ChatPreview() {
  return (
    <div className="mobile-chat-preview" style={{
      width: '100%', maxWidth: 900,
      display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center',
    }}>
      {/* Phone mockup */}
      <div style={{
        width: 380, flexShrink: 0,
        borderRadius: 32, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0b0b16',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(233,30,140,0.08)',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', zIndex: 5 }} />
        {/* Glow line */}
        <div style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(233,30,140,0.4), transparent)', zIndex: 5 }} />

        {/* Header */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          background: 'rgba(12,10,22,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '32px 32px 0 0',
        }}>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>‹</div>
          <div style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden', border: '1.5px solid rgba(233,30,140,0.4)', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #5b42f3, #e91e8c)' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, background: '#0c0a16', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>😏</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Luna</div>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 500 }}>online</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, position: 'relative' }}>
            📸
            <span style={{ position: 'absolute', top: -3, right: -3, fontSize: 8, fontWeight: 800, background: '#e91e8c', color: '#fff', borderRadius: 100, padding: '0 4px', minWidth: 14, textAlign: 'center' }}>3</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 3, height: 420 }}>
          {/* Date separator */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <span style={{ padding: '3px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Vandaag</span>
          </div>

          {/* AI message */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #5b42f3, #e91e8c)', flexShrink: 0 }} />
            <div style={{ padding: '7px 10px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.85)', maxWidth: '75%', lineHeight: 1.5, position: 'relative' }}>
              Hey schat! Ik lag net aan je te denken... 😏
              <span style={{ position: 'absolute', bottom: 3, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>14:32</span>
              <span style={{ display: 'inline-block', width: 36, height: 12 }} />
            </div>
          </div>

          {/* User message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ padding: '7px 10px', borderRadius: '16px 16px 4px 16px', background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(233,30,140,0.08))', border: '1px solid rgba(233,30,140,0.12)', fontSize: 13, color: 'rgba(255,255,255,0.92)', maxWidth: '75%', lineHeight: 1.5, position: 'relative' }}>
              Oh ja? Vertel eens meer... 🔥
              <span style={{ display: 'inline-block', width: 52, height: 12 }} />
              <span style={{ position: 'absolute', bottom: 3, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 2 }}>
                14:33 <span style={{ color: '#e91e8c', fontSize: 11 }}>✓✓</span>
              </span>
            </div>
          </div>

          {/* AI message with longer text */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ padding: '7px 10px', borderRadius: '4px 16px 16px 4px', background: 'rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.85)', maxWidth: '75%', lineHeight: 1.5, position: 'relative' }}>
              Mmm, ik mis je gewoon heel erg vandaag. Wil je een foto? 😘
              <span style={{ display: 'inline-block', width: 36, height: 12 }} />
              <span style={{ position: 'absolute', bottom: 3, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>14:33</span>
            </div>
          </div>

          {/* User */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ padding: '7px 10px', borderRadius: '16px 4px 4px 16px', background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(233,30,140,0.08))', border: '1px solid rgba(233,30,140,0.12)', fontSize: 13, color: 'rgba(255,255,255,0.92)', maxWidth: '75%', lineHeight: 1.5, position: 'relative' }}>
              Ja stuur maar! 😍
              <span style={{ display: 'inline-block', width: 52, height: 12 }} />
              <span style={{ position: 'absolute', bottom: 3, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 2 }}>
                14:33 <span style={{ color: '#e91e8c', fontSize: 11 }}>✓✓</span>
              </span>
            </div>
          </div>

          {/* AI photo message */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #5b42f3, #e91e8c)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '65%' }}>
              <div style={{ padding: '7px 10px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, position: 'relative' }}>
                Hier, speciaal voor jou 😘
                <span style={{ display: 'inline-block', width: 36, height: 12 }} />
                <span style={{ position: 'absolute', bottom: 3, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>14:34</span>
              </div>
              {/* Fake photo placeholder */}
              <div style={{
                width: '100%', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(91,66,243,0.15))',
                border: '1px solid rgba(233,30,140,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>📸</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))', padding: '12px 8px 4px', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>14:34</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: '6px 8px 10px', background: 'rgba(12,10,22,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, alignItems: 'center', borderRadius: '0 0 32px 32px' }}>
          <div style={{ fontSize: 18, opacity: 0.4, padding: '0 4px' }}>😊</div>
          <div style={{ flex: 1, padding: '8px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Bericht...</div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>
      </div>

      {/* Feature highlights next to phone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
        {[
          { icon: '💬', title: 'Real conversations', desc: 'Chat naturally in Dutch. She remembers your name, your stories, and what you like.' },
          { icon: '📸', title: 'AI-generated photos', desc: 'Ask for photos in any pose, outfit, or scenario. Generated in seconds.' },
          { icon: '🎭', title: 'Roleplay scenarios', desc: '12 built-in scenarios — nurse, secretary, stewardess. One click to start.' },
          { icon: '😏', title: 'No limits', desc: 'Full mature content. No filters, no judgment. Your companion does everything you ask.' },
        ].map(f => (
          <div key={f.title} style={{
            padding: '18px 20px', borderRadius: 16,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
