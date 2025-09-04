import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
  title: 'TradeAI Tutor - Master Plumbing Skills with AI',
  description: 'Master plumbing skills with AI-powered visual learning. Get 3D models, step-by-step guides, and interactive diagrams for plumbing apprentices.',
  keywords: 'plumbing training, apprentice learning, trade skills, AI tutor, 3D plumbing models, visual plumbing guide, plumbing code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}