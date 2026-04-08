import Link from 'next/link'
import Logo from '@/components/Logo'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--card-border)', padding: '0 16px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(30px)', background: 'rgba(6,6,17,0.85)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo size="sm" /></Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--muted-fg)', textDecoration: 'none' }}>← Back to home</Link>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 100px' }}>
        <div style={{ fontSize: 13, color: '#e91e8c', fontWeight: 600, marginBottom: 6 }}>Legal</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: 14, marginBottom: 40 }}>Last updated: April 8, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 15, lineHeight: 1.8, color: 'var(--fg-2)' }}>
          <Section title="1. Acceptance of Terms">
            By accessing or using SenseMates (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. You must be at least 18 years old to use SenseMates.
          </Section>

          <Section title="2. Eligibility">
            SenseMates is an adults-only platform. By creating an account, you confirm that you are at least 18 years of age. We reserve the right to terminate accounts of users who do not meet this requirement. We may request age verification at any time.
          </Section>

          <Section title="3. Account Responsibilities">
            You are responsible for maintaining the security of your account credentials. You agree not to share your account with others. You are responsible for all activity that occurs under your account. You must notify us immediately of any unauthorized use.
          </Section>

          <Section title="4. AI-Generated Content">
            SenseMates uses artificial intelligence to generate text responses and images. All content is AI-generated and does not represent real people. The AI companions are fictional characters — they do not have feelings, consciousness, or real emotions. Generated images depict fictional characters and are not photographs of real individuals.
          </Section>

          <Section title="5. Mature Content">
            SenseMates may generate content of an adult/mature nature, including but not limited to: suggestive dialogue, romantic scenarios, and AI-generated images depicting fictional adult characters. By using the Service, you acknowledge and consent to encountering such content. You agree that you are legally permitted to view adult content in your jurisdiction.
          </Section>

          <Section title="6. Acceptable Use">
            You agree not to: (a) use the Service to generate content depicting minors in any context; (b) attempt to use the Service for illegal purposes; (c) share generated content in ways that could be mistaken for real photographs of real people; (d) resell or redistribute generated content commercially; (e) attempt to reverse-engineer the Service; (f) harass, abuse, or threaten SenseMates staff or other users.
          </Section>

          <Section title="7. Subscriptions & Payments">
            SenseMates offers free and paid subscription tiers. Paid subscriptions are billed monthly and renew automatically unless cancelled. You may cancel at any time through your account settings. Refunds are handled on a case-by-case basis. Prices are subject to change with 30 days notice.
          </Section>

          <Section title="8. Content Ownership">
            You retain ownership of the text you input. AI-generated text and images are provided for your personal use. SenseMates retains the right to use anonymized, aggregated data to improve the Service. We do not claim ownership over your conversations.
          </Section>

          <Section title="9. Service Availability">
            SenseMates is provided &quot;as is&quot; without warranties. We do not guarantee uninterrupted availability. We may modify, suspend, or discontinue features at any time. AI responses may vary in quality and are not guaranteed to be accurate or consistent.
          </Section>

          <Section title="10. Termination">
            We may terminate or suspend your account at our sole discretion, with or without cause. Upon termination, your data may be permanently deleted. You may delete your account and data at any time through Settings.
          </Section>

          <Section title="11. Limitation of Liability">
            SenseMates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
          </Section>

          <Section title="12. Changes to Terms">
            We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance. We will notify users of material changes via email or in-app notification.
          </Section>

          <Section title="13. Contact">
            For questions about these Terms, contact us at: <strong style={{ color: '#e91e8c' }}>legal@sensemates.com</strong>
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
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  )
}
