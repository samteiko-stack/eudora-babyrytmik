import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'

const interTight = Inter_Tight({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Eudora Babyrytmik - Anmälan till babysång',
  description: 'Anmälan till babysång på Södermalm och Gärdet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className={interTight.className}>
      <body>{children}</body>
    </html>
  )
}
