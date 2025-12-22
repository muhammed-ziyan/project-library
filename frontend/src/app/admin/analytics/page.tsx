'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'
import { analyticsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Activity,
  FileText,
  FolderOpen
} from 'lucide-react'

interface AnalyticsOverview {
  users: {
    total: number
    active: number
    completed: number
    completionRate: number
  }
  engagement: {
    averageTimeSpent: number
    totalSessions: number
    averageSessionsPerUser: number
  }
  projects: {
    totalProjects: number
    averageEnrollmentsPerProject: number
  }
  submissions: {
    total: number
    averagePerUser: number
  }
}

interface ProjectPerformance {
  projectId: string
  projectSlug: string
  projectTitle: string
  totalEnrollments: number
  completedEnrollments: number
  completionRate: number
  averageTimeSpent: number
  averageCompletionPercentage: number
}

export default function AnalyticsPage() {
  const { token } = useAdminAuth()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [projectPerformance, setProjectPerformance] = useState<ProjectPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        const [overviewData, projectData] = await Promise.all([
          analyticsAPI.getOverview(token),
          analyticsAPI.getProjectPerformance(token)
        ])
        setOverview(overviewData)
        setProjectPerformance(projectData.projects)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive overview of platform performance and user engagement
        </p>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.users.total}</div>
              <p className="text-xs text-gray-500 mt-1">All enrolled users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{overview.users.active}</div>
              <p className="text-xs text-gray-500 mt-1">Active in last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{overview.users.completed}</div>
              <p className="text-xs text-gray-500 mt-1">Finished projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{overview.users.completionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Overall completion</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Engagement Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.floor(overview.engagement.averageTimeSpent / 60)}h {overview.engagement.averageTimeSpent % 60}m
              </div>
              <p className="text-xs text-gray-500 mt-1">Per user average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.engagement.totalSessions}</div>
              <p className="text-xs text-gray-500 mt-1">All user sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sessions Per User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.engagement.averageSessionsPerUser.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Average sessions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project & Submission Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.projects.totalProjects}</div>
              <p className="text-xs text-gray-500 mt-1">Available projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.projects.averageEnrollmentsPerProject.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Per project</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.submissions.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                {overview.submissions.averagePerUser.toFixed(1)} per user
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Performance
          </CardTitle>
          <CardDescription>
            Detailed metrics for each project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Project
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Enrollments
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Avg Progress
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.map((project) => (
                  <tr key={project.projectId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4">
                      <div className="font-medium">{project.projectTitle}</div>
                      <div className="text-xs text-gray-500">{project.projectSlug}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline">{project.totalEnrollments}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {project.completedEnrollments}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div>
                        <div className="font-medium">{project.completionRate}%</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-medium">{project.averageCompletionPercentage}%</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {Math.floor(project.averageTimeSpent / 60)}h {project.averageTimeSpent % 60}m
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projectPerformance.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No projects found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

