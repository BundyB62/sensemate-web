import type { Metadata } from 'next'
import './globals.css'
import ParticleField from '@/components/ParticleField'

export const metadata: Metadata = {
  title: 'SenseMate — Your AI SenseMate',
  description: 'Create your own AI SenseMate. Talk, connect, and build a real bond.',
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'SenseMate — Your AI SenseMate',
    description: 'Create your own AI SenseMate. Talk, connect, and build a real bond.',
    images: [{ url: '/logo.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#060514' }}>
        <ParticleField />
        {/* Subtle silhouette */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/silhouettes.png"
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              mixBlendMode: 'screen',
              opacity: 0.15,
            }}
          />
        </div>
        {children}
      </body>
    </html>
  )
}
