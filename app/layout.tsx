import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clearlearn - Adaptive Visual Learning System',
  description: 'AI-powered tutor that explains any concept through multiple modalities',
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