import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChemTutor AI - Organic Chemistry AI Tutor',
  description: 'AI-powered organic chemistry tutor with video explanations. Get instant help with reaction mechanisms, stereochemistry, and synthesis problems.',
  keywords: 'organic chemistry, AI tutor, pre-med, reaction mechanisms, stereochemistry, synthesis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen gradient-bg">
          {children}
        </div>
      </body>
    </html>
  )
}