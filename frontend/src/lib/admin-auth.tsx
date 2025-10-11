'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { projectsAPI } from './api'

interface AdminUser {
  id: string
  username: string
  createdAt: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_TOKEN_KEY = 'admin-token'
const ADMIN_USER_KEY = 'admin-user'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY)
        const storedUser = localStorage.getItem(ADMIN_USER_KEY)

        if (storedToken && storedUser) {
          try {
            // Verify token with backend
            await projectsAPI.verifyAdmin(storedToken)
            setToken(storedToken)
            setAdmin(JSON.parse(storedUser))
          } catch (error) {
            console.log('Token verification failed, clearing storage')
            // Token is invalid, clear storage
            localStorage.removeItem(ADMIN_TOKEN_KEY)
            localStorage.removeItem(ADMIN_USER_KEY)
            setToken(null)
            setAdmin(null)
          }
        } else {
          // No stored credentials
          setToken(null)
          setAdmin(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setToken(null)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await projectsAPI.adminLogin(username, password)
      
      // Store token and user info
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token)
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.admin))
      
      setToken(response.token)
      setAdmin(response.admin)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
    setToken(null)
    setAdmin(null)
  }

  const isAuthenticated = !!admin && !!token

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Protected route wrapper
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
