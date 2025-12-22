'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminUsersAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserActivityLog } from '@/components/user-activity-log'
import { 
  ArrowLeft,
  User,
  Mail,
  School,
  BookOpen,
  Clock,
  CheckCircle,
  FileText,
  Activity,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface UserDetail {
  enrollment: {
    id: string
    email: string
    name: string | null
    school: string | null
    classNum: number
    createdAt: string
    lastActivityAt: string | null
    completedAt: string | null
    timeSpentMinutes: number | null
  }
  project: {
    id: string
    slug: string
    title: string
    shortDesc: string
    level: string
    guidance: string
    totalSteps: number
  }
  progress: {
    completedSteps: number
    totalSteps: number
    completionPercentage: number
    completedChecklists: number
    totalChecklists: number
  }
  submissions: Array<{
    id: string
    urlOrText: string
    createdAt: string
  }>
  recentActivity: Array<{
    id: string
    activityType: string
    metadata: any
    createdAt: string
  }>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAdminAuth()
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!token || !params.id) return

      setIsLoading(true)
      try {
        const data = await adminUsersAPI.getUserDetail(token, params.id as string)
        setUserDetail(data)
      } catch (error) {
        console.error('Failed to fetch user details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetail()
  }, [token, params.id])

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatMinutes(minutes: number | null): string {
    if (!minutes) return '0 minutes'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} minutes`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">User not found</p>
        <Button asChild variant="outline">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>
    )
  }

  const { enrollment, project, progress, submissions, recentActivity } = userDetail

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {enrollment.name || 'Anonymous User'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {enrollment.email}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.completionPercentage}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {progress.completedSteps} of {progress.totalSteps} steps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMinutes(enrollment.timeSpentMinutes)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total time tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Recent activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </div>
              <div className="text-base">{enrollment.email}</div>
            </div>

            {enrollment.name && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Name
                </div>
                <div className="text-base">{enrollment.name}</div>
              </div>
            )}

            {enrollment.school && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <School className="h-4 w-4 inline mr-1" />
                  School
                </div>
                <div className="text-base">{enrollment.school}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Class
              </div>
              <Badge>Class {enrollment.classNum}</Badge>
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled</span>
                  <span>{formatDate(enrollment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Activity</span>
                  <span>{formatDate(enrollment.lastActivityAt)}</span>
                </div>
                {enrollment.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-green-600">{formatDate(enrollment.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              {enrollment.completedAt ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : enrollment.lastActivityAt ? (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-0">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-0">
                  Not Started
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Title
              </div>
              <div className="text-lg font-semibold">{project.title}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {project.shortDesc}
              </div>
            </div>

            <div className="flex gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Level
                </div>
                <Badge variant="outline">{project.level}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Guidance
                </div>
                <Badge variant="outline">{project.guidance}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Progress Details
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Steps Completed</span>
                  <span className="font-medium">
                    {progress.completedSteps} / {progress.totalSteps}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progress.completionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Checklist Items</span>
                  <span className="font-medium">
                    {progress.completedChecklists} / {progress.totalChecklists}
                  </span>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/admin/projects/${project.id}`}>
                View Project Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Submissions */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submissions ({submissions.length})
            </CardTitle>
            <CardDescription>
              All submissions by this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border dark:border-gray-700 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium break-all">
                      {submission.urlOrText}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(submission.createdAt)}
                    </div>
                  </div>
                  {submission.urlOrText.startsWith('http') && (
                    <Button asChild variant="ghost" size="sm" className="ml-2">
                      <a href={submission.urlOrText} target="_blank" rel="noopener noreferrer">
                        Open
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Recent activities and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserActivityLog activities={recentActivity} showMetadata />
        </CardContent>
      </Card>
    </div>
  )
}

