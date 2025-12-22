'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminUsersAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  school: string | null
  classNum: number
  createdAt: string
  lastActivityAt: string | null
  completedAt: string | null
  timeSpentMinutes: number | null
  Project: {
    id: string
    slug: string
    title: string
    level: string
    guidance: string
  }
  progress: {
    completedSteps: number
    totalSteps: number
    completionPercentage: number
  }
  _count: {
    progress: number
    submissions: number
    activities: number
  }
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function UserManagementPage() {
  const { token } = useAdminAuth()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [completionStatus, setCompletionStatus] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        const data = await adminUsersAPI.listUsers(token, {
          page: currentPage,
          pageSize: 20,
          search: searchTerm || undefined,
          completionStatus
        })
        setUsers(data.users)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [token, currentPage, searchTerm, completionStatus])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleExport = async () => {
    if (!token) return

    try {
      const data = await adminUsersAPI.exportUsers(token, {
        search: searchTerm || undefined,
        completionStatus
      })
      
      // Convert to CSV
      const csvData = [
        ['Email', 'Name', 'School', 'Class', 'Project', 'Completion %', 'Time Spent (min)', 'Enrolled', 'Last Activity', 'Completed'],
        ...data.users.map(u => [
          u.email,
          u.name || '',
          u.school || '',
          u.class,
          u.project,
          u.completionPercentage,
          u.timeSpentMinutes,
          new Date(u.enrolledAt).toLocaleDateString(),
          u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : '',
          u.completedAt ? new Date(u.completedAt).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n')

      // Download
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export users:', error)
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all enrolled users
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by email, name, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={completionStatus}
              onChange={(e) => {
                setCompletionStatus(e.target.value as any)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Users</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>

            {/* Export Button */}
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination ? `${pagination.total} Total Users` : 'Users'}
          </CardTitle>
          <CardDescription>
            Click on a user to view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Activity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{user.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.school && (
                          <div className="text-xs text-gray-400">{user.school} - Class {user.classNum}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-sm">{user.Project.title}</div>
                        <div className="text-xs text-gray-500">{user.Project.level}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium">{user.progress.completionPercentage}%</div>
                        <div className="text-xs text-gray-500">
                          {user.progress.completedSteps}/{user.progress.totalSteps} steps
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${user.progress.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {user.timeSpentMinutes ? `${user.timeSpentMinutes} min` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last: {formatDate(user.lastActivityAt)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.completedAt ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : user.lastActivityAt ? (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-0">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-0">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Started
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

