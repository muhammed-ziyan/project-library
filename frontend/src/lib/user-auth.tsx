'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { userAuthAPI } from './api'

interface User {
  id: string
  phoneNumber: string
  email: string | null
  name: string | null
  school: string | null
  classNum: number | null
  createdAt: string
}

interface UserAuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  register: (data: {
    enrollmentId: string
    phoneNumber: string
    password: string
    name?: string
    school?: string
    classNum?: number
  }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

const USER_TOKEN_KEY = 'user-token'
const USER_DATA_KEY = 'user-data'

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(USER_TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_DATA_KEY)

        if (storedToken && storedUser) {
          try {
            // Verify token with backend
            await userAuthAPI.me(storedToken)
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
          } catch (error) {
            console.log('Token verification failed, clearing storage')
            // Token is invalid, clear storage
            localStorage.removeItem(USER_TOKEN_KEY)
            localStorage.removeItem(USER_DATA_KEY)
            setToken(null)
            setUser(null)
          }
        } else {
          // No stored credentials
          setToken(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const register = async (data: {
    enrollmentId: string
    phoneNumber: string
    password: string
    name?: string
    school?: string
    classNum?: number
  }) => {
    try {
      const response = await userAuthAPI.register(data)
      
      // Store token and user info
      localStorage.setItem(USER_TOKEN_KEY, response.token)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user))
      
      setToken(response.token)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await userAuthAPI.login(phoneNumber, password)
      
      // Store token and user info
      localStorage.setItem(USER_TOKEN_KEY, response.token)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user))
      
      setToken(response.token)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem(USER_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <UserAuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading,
        register,
        login, 
        logout, 
        isAuthenticated: !!token && !!user 
      }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}

