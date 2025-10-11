'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navigation() {
  const isAdminEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PL</span>
            </div>
            <span className="font-bold text-xl">Project Library</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            {isAdminEnabled && (
              <Link href="/admin/upload">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
