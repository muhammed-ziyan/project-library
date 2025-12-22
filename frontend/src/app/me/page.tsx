'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/lib/user-auth'
import { userAuthAPI, enrollmentsAPI } from '@/lib/api'
import { AddGroupMember } from '@/components/add-group-member'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, BookOpen, LogOut, Mail, GraduationCap, School, Clock, CheckCircle, AlertCircle, Phone, Users, UserPlus, X } from 'lucide-react'
import Link from 'next/link'

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, token, logout, isAuthenticated, isLoading: authLoading } = useUserAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('')

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      if (!token) return

      try {
        const data = await userAuthAPI.me(token)
        setProfile(data)
      } catch (err: any) {
        setError(err.detail || err.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, token, authLoading, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleAddMember = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId)
    setShowAddMember(true)
  }

  const handleCloseAddMember = async () => {
    setShowAddMember(false)
    setSelectedEnrollmentId('')
    
    // Refresh profile to show updated group info
    if (token) {
      try {
        const data = await userAuthAPI.me(token)
        setProfile(data)
      } catch (err) {
        console.error('Failed to refresh profile:', err)
      }
    }
  }

  const handleUnassign = async (enrollmentId: string) => {
    if (!token) return
    
    if (!confirm('Are you sure you want to leave this project? Your progress will be saved, but you will need to enroll again to continue.')) {
      return
    }

    try {
      await enrollmentsAPI.unassign(enrollmentId, token)
      
      // Refresh profile
      const data = await userAuthAPI.me(token)
      setProfile(data)
    } catch (err: any) {
      alert(err.detail || err.message || 'Failed to leave project. Please try again.')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 px-4 pb-4 md:px-8 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.name || user?.phoneNumber}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/me/messages">
                <Mail className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </p>
                <p className="font-medium">{profile?.user?.phoneNumber}</p>
              </div>
              {profile?.user?.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{profile.user.email}</p>
                </div>
              )}
              {profile?.user?.name && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium">{profile.user.name}</p>
                </div>
              )}
              {profile?.user?.school && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <School className="h-4 w-4" />
                    School
                  </p>
                  <p className="font-medium">{profile.user.school}</p>
                </div>
              )}
              {profile?.user?.classNum && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Class
                  </p>
                  <p className="font-medium">Class {profile.user.classNum}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Projects
            </CardTitle>
            <CardDescription>
              {profile?.enrollments?.length || 0} project{profile?.enrollments?.length !== 1 ? 's' : ''} enrolled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.enrollments?.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
                <Button asChild>
                  <Link href="/browse">Browse Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.enrollments?.map((enrollment: any) => {
                  const isGroup = !!enrollment.group
                  const hasSecondMember = enrollment.group?.secondMemberName
                  
                  return (
                  <Card key={enrollment.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {enrollment.project.title}
                            </h3>
                            {isGroup && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Group
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {enrollment.project.shortDesc}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">{enrollment.project.level}</Badge>
                            <Badge variant="outline">{enrollment.project.guidance}</Badge>
                          </div>
                          {isGroup && (
                            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                Team Members:
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span>You (Team Leader)</span>
                                  {hasSecondMember ? (
                                    <>
                                      <span>•</span>
                                      <span>{enrollment.group.secondMemberName}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>•</span>
                                      <span className="text-orange-600 dark:text-orange-400">No second member yet</span>
                                    </>
                                  )}
                                </div>
                                {!hasSecondMember && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={() => handleAddMember(enrollment.id)}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {!isGroup && (
                            <div className="mb-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleAddMember(enrollment.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Team Member
                              </Button>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span className="font-medium">{enrollment.progress.completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress.completionPercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {enrollment.progress.completedSteps} of {enrollment.progress.totalSteps} steps completed
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {enrollment.completedAt ? (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle className="h-4 w-4" />
                                  Completed {new Date(enrollment.completedAt).toLocaleDateString()}
                                </div>
                              ) : enrollment.lastActivityAt ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Last activity {new Date(enrollment.lastActivityAt).toLocaleDateString()}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button asChild>
                            <Link href={`/learn/${enrollment.id}`}>
                              {enrollment.completedAt ? 'Review' : 'Continue'}
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassign(enrollment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Leave Project
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto py-6">
            <Link href="/browse" className="flex flex-col items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Browse More Projects</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6">
            <Link href="/me/messages" className="flex flex-col items-center gap-2">
              <Mail className="h-6 w-6" />
              <span>View Messages</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6">
            <Link href="/" className="flex flex-col items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <span>Go to Home</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Add Group Member Modal */}
      <AddGroupMember
        isOpen={showAddMember}
        onClose={handleCloseAddMember}
        enrollmentId={selectedEnrollmentId}
      />
    </div>
  )
}

