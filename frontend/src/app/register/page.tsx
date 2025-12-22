'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserAuth } from '@/lib/user-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/phone-input'
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, isAuthenticated } = useUserAuth()
  
  const [enrollmentId, setEnrollmentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [classNum, setClassNum] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get enrollmentId from URL if provided
    const eid = searchParams.get('enrollmentId')
    if (eid) {
      setEnrollmentId(eid)
    }
  }, [searchParams])

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push('/me')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!enrollmentId) {
      setError('Enrollment ID is required. Please enroll in a project first.')
      return
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Phone number is required.')
      return
    }

    // PhoneInput component ensures proper format, but validate it has country code
    if (!phoneNumber.startsWith('+')) {
      setError('Please select a country code.')
      return
    }

    setIsLoading(true)

    try {
      await register({
        enrollmentId,
        phoneNumber,
        password,
        name: name || undefined,
        school: school || undefined,
        classNum: classNum ? parseInt(classNum) : undefined,
      })
      router.push('/me')
    } catch (err: any) {
      setError(err.detail || err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          </div>
          <CardDescription>
            Register to save your progress and access your projects anytime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {enrollmentId && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Enrollment found! Complete registration to continue.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="enrollmentId">Enrollment ID *</Label>
              <Input
                id="enrollmentId"
                type="text"
                placeholder="Your enrollment ID"
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                You received this when you enrolled in a project
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <PhoneInput
                id="phoneNumber"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
          
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-medium">Optional Information</p>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  type="text"
                  placeholder="Your school name"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classNum">Class/Grade</Label>
                <Input
                  id="classNum"
                  type="number"
                  placeholder="e.g., 10"
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  disabled={isLoading}
                  min="1"
                  max="12"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}

