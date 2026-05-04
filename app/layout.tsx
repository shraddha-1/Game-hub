import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Us, the Game',
  description: 'Cute little games for people who love each other 💕',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
