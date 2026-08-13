import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVariable.ttf',
  display: 'swap',
  weight: '100 900',
  variable: '--font-geist',
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
    <html lang="sv" className={`${geist.variable} ${geist.className}`}>
      <body>{children}</body>
    </html>
  )
}
