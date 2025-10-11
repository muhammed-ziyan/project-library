'use client'

import { AdminAuthProvider } from '@/lib/admin-auth'
import { usePathname } from 'next/navigation'
import { AdminProtectedRoute } from '@/lib/admin-auth'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        // Login page - no protection needed
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      ) : (
        // Protected admin pages
        <AdminProtectedRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </AdminProtectedRoute>
      )}
    </AdminAuthProvider>
  )
}
