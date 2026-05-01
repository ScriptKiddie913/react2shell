import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Trump of Spades | Online Multiplayer Card Game',
  description: 'Challenge your friends in the ultimate trick-taking card game. Select your trump and dominate the table!',
  keywords: ['card game', 'multiplayer', 'spades', 'trump', 'trick-taking'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
