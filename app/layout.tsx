import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SenseMate — Jouw AI Companion',
  description: 'Maak je eigen AI companion aan. Praat, flirt en bouw een echte band op.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
