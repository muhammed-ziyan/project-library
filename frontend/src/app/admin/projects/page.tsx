'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'
import { projectsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Eye, 
  Trash2, 
  Plus,
  FolderOpen,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  title: string
  shortDesc: string
  level: string
  guidance: string
  subjects: Array<{ Subject: { name: string } }>
  tags: Array<{ Tag: { name: string } }>
  createdAt: string
  _count: {
    enrollments: number
    steps: number
  }
}

interface ProjectsResponse {
  projects: Project[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function AdminProjectsPage() {
  const { token } = useAdminAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = async (page = 1, searchTerm = '') => {
    if (!token) return

    try {
      setIsLoading(true)
      const data = await projectsAPI.listAdminProjects(token, {
        page,
        pageSize: 20,
        search: searchTerm || undefined
      })
      setProjects(data.projects)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [token])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProjects(1, search)
  }

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return
    }

    if (!token) return

    try {
      await projectsAPI.deleteAdminProject(token, projectId)
      // Refresh the projects list
      fetchProjects(pagination.page, search)
    } catch (error: any) {
      alert(error.message || 'Failed to delete project')
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getGuidanceColor = (guidance: string) => {
    switch (guidance) {
      case 'FULLY_GUIDED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'SEMI_GUIDED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'UNGUIDED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all projects in the library
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload Project
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects by title, slug, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {search ? 'No projects match your search criteria.' : 'Get started by uploading your first project.'}
              </p>
              <Button asChild>
                <Link href="/admin/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <Badge className={getLevelColor(project.level)}>
                        {project.level}
                      </Badge>
                      <Badge className={getGuidanceColor(project.guidance)}>
                        {project.guidance.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {project.shortDesc}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project._count.enrollments} enrollments
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {project._count.steps} steps
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.subjects.slice(0, 3).map((subject) => (
                        <Badge key={subject.Subject.name} variant="secondary" className="text-xs">
                          {subject.Subject.name}
                        </Badge>
                      ))}
                      {project.subjects.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/projects/${project.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(project.id, project.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} projects
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProjects(pagination.page - 1, search)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProjects(pagination.page + 1, search)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


