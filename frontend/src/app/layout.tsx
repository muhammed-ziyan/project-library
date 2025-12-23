import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navigation } from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Library',
  description: 'A comprehensive web-based Project Library platform for AI/ML school projects',
  icons: {
    icon: '/images/logo/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}