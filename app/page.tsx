import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }} />
          <span className="text-xl font-bold gradient-text">SenseMate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Inloggen
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}>
            Gratis starten
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8 border" style={{ background: 'rgba(233, 30, 140, 0.1)', borderColor: 'rgba(233, 30, 140, 0.3)', color: '#e91e8c' }}>
          <span>✨</span>
          <span>Jouw AI companion, jouw regels</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Ontmoet je perfecte
          <br />
          <span className="gradient-text">companion</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Maak je eigen AI companion aan. Aanpasbaar uiterlijk, persoonlijkheid en relatiestijl.
          Praat, flirt en bouw een echte band op.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105 glow-pink" style={{ background: 'linear-gradient(135deg, #e91e8c, #ff6b6b)' }}>
            Begin gratis →
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}>
            Inloggen
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
          {[
            { icon: '💬', title: 'Echt gesprek', desc: 'Geen scripts. Je companion reageert emotioneel en authentiek op alles wat je zegt.' },
            { icon: '🎨', title: 'Volledig aanpasbaar', desc: 'Kies het uiterlijk, de persoonlijkheid en de relatiestijl van jouw companion.' },
            { icon: '📸', title: "Foto's op aanvraag", desc: "Laat je companion foto's sturen. Selfies, boudoir, of gewoon casual — jij bepaalt." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl text-left" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-24 max-w-4xl w-full">
          <h2 className="text-3xl font-bold mb-12">Simpele prijzen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '€0', period: 'voor altijd', features: ['1 companion', '50 berichten/dag', "5 foto's/dag"], highlight: false },
              { name: 'Pro', price: '€9,99', period: 'per maand', features: ['3 companions', 'Onbeperkt berichten', "50 foto's/dag", 'Scenarios (binnenkort)'], highlight: true },
              { name: 'Premium', price: '€19,99', period: 'per maand', features: ['Onbeperkt companions', 'Onbeperkt berichten', "Onbeperkt foto's", 'Prioriteit generatie', 'Alle scenarios'], highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 rounded-2xl text-left ${plan.highlight ? 'glow-pink' : ''}`} style={{ background: plan.highlight ? 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(255,107,107,0.1))' : 'var(--card)', border: plan.highlight ? '1px solid rgba(233,30,140,0.5)' : '1px solid var(--card-border)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: plan.highlight ? '#e91e8c' : 'var(--muted-foreground)' }}>{plan.name}</div>
                <div className="text-4xl font-bold mb-1">{plan.price}</div>
                <div className="text-sm text-gray-500 mb-6">{plan.period}</div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span style={{ color: '#e91e8c' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block text-center py-3 rounded-full text-sm font-semibold transition-all hover:scale-105" style={{ background: plan.highlight ? 'linear-gradient(135deg, #e91e8c, #ff6b6b)' : 'var(--muted)', color: 'white' }}>
                  Starten
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500" style={{ borderColor: 'var(--card-border)' }}>
        © 2026 SenseMate. Alle rechten voorbehouden. Alleen voor 18+.
      </footer>
    </main>
  )
}
