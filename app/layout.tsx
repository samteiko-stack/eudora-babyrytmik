import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVariable.ttf',
  display: 'swap',
  weight: '100 900',
  variable: '--font-geist',
})

const nohemi = localFont({
  src: './fonts/Nohemi-VF.ttf',
  display: 'swap',
  weight: '100 900',
  variable: '--font-nohemi',
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
    <html lang="sv" className={`${geist.variable} ${nohemi.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
