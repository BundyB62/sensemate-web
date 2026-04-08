import Link from 'next/link'
import Logo from '@/components/Logo'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--card-border)', padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(30px)', background: 'rgba(6,6,17,0.85)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo size="sm" /></Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none' }}>← Back to home</Link>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 100px' }}>
        <div style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600, marginBottom: 6 }}>Legal</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: 14, marginBottom: 40 }}>Last updated: April 8, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 15, lineHeight: 1.8, color: 'var(--fg-2)' }}>
          <Section title="1. Information We Collect">
            <strong>Account information:</strong> email address and password (hashed). We do not collect your real name, phone number, or physical address.<br /><br />
            <strong>Companion data:</strong> the characters you create (appearance settings, personality traits, names). This is stored to provide the Service.<br /><br />
            <strong>Conversations:</strong> your chat messages and AI responses are stored to maintain conversation history and improve AI memory features.<br /><br />
            <strong>Generated images:</strong> AI-generated images are stored temporarily on third-party servers (Fal.ai, Novita.ai) and may be cached for performance.<br /><br />
            <strong>Usage data:</strong> basic analytics including pages visited, features used, and error logs. We use this to improve the Service.
          </Section>

          <Section title="2. How We Use Your Data">
            We use your data exclusively to: (a) provide and maintain the Service; (b) process your subscription payments; (c) improve AI response quality through anonymized analysis; (d) send account-related communications (password resets, important updates). We do NOT sell your personal data. We do NOT use your conversations for advertising. We do NOT share identifiable data with third parties for marketing.
          </Section>

          <Section title="3. Data Storage & Security">
            Your data is stored on Supabase (hosted on AWS) with encryption at rest and in transit. Passwords are hashed using bcrypt. We use HTTPS for all data transmission. Access to user data is restricted to essential personnel only. AI-generated images are processed by third-party AI providers (Fal.ai, Novita.ai) — see their respective privacy policies for image processing details.
          </Section>

          <Section title="4. Data Retention">
            Your account data is retained as long as your account is active. Conversation history is retained for the duration of your account. You may delete individual companions and their associated data at any time. When you delete your account, all personal data is permanently removed within 30 days. AI-generated images on third-party servers are automatically deleted after 24 hours.
          </Section>

          <Section title="5. Your Rights (GDPR)">
            If you are located in the European Economic Area (EEA), you have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion of your data; (d) restrict or object to data processing; (e) data portability; (f) withdraw consent at any time. To exercise these rights, contact us at <strong style={{ color: '#e91e8c' }}>privacy@sensemates.com</strong>.
          </Section>

          <Section title="6. Cookies">
            We use essential cookies for: authentication (keeping you logged in) and preferences. We do NOT use tracking cookies, advertising cookies, or third-party analytics cookies. We do not track you across websites.
          </Section>

          <Section title="7. Third-Party Services">
            We use the following third-party services:<br /><br />
            <strong>Supabase</strong> — database and authentication<br />
            <strong>Fal.ai</strong> — AI image generation<br />
            <strong>Novita.ai</strong> — AI image generation (NSFW-capable)<br />
            <strong>OpenRouter</strong> — AI language model routing<br /><br />
            These services process data as needed to provide their functionality. We recommend reviewing their respective privacy policies.
          </Section>

          <Section title="8. Children&apos;s Privacy">
            SenseMates is strictly for users aged 18 and older. We do not knowingly collect data from anyone under 18. If we discover that a user is under 18, their account will be immediately terminated and all associated data deleted.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance.
          </Section>

          <Section title="10. Contact Us">
            For privacy-related questions or to exercise your data rights:<br /><br />
            Email: <strong style={{ color: '#e91e8c' }}>privacy@sensemates.com</strong><br />
            Data Protection Officer: <strong style={{ color: '#e91e8c' }}>dpo@sensemates.com</strong>
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{title}</h2>
      <div style={{ margin: 0 }}>{children}</div>
    </div>
  )
}
