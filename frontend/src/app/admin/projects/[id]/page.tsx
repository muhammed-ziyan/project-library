'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { projectsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Trash2,
  Users,
  FileText,
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

interface Project {
  id: string
  slug: string
  title: string
  shortDesc: string
  longDesc: string
  classMin: number
  classMax: number
  level: string
  guidance: string
  subjects: Array<{ Subject: { name: string } }>
  tags: Array<{ Tag: { name: string } }>
  tools: Array<{ name: string }>
  prerequisites: string[]
  durationHrs?: number
  steps: Array<{
    id: string
    order: number
    title: string
    description: string
    checklist: Array<{ text: string }>
    resources: Array<{ title: string; url: string; type: string }>
  }>
  submission?: {
    type: string
    instruction: string
    allowedTypes: string[]
  }
  createdAt: string
  _count: {
    enrollments: number
    steps: number
  }
}

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAdminAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!token || !params.id) return

      try {
        setIsLoading(true)
        const data = await projectsAPI.getAdminProject(token, params.id as string)
        setProject(data)
      } catch (error) {
        console.error('Failed to fetch project:', error)
        router.push('/admin/projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [token, params.id, router])

  const handleDelete = async () => {
    if (!project || !token) return

    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await projectsAPI.deleteAdminProject(token, project.id)
      router.push('/admin/projects')
    } catch (error: any) {
      alert(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Project not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/admin/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Project details and management
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting || project._count.enrollments > 0}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Project'}
        </Button>
      </div>

      {project._count.enrollments > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Cannot delete project with active enrollments
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                This project has {project._count.enrollments} active enrollment(s). 
                All enrollments must be completed or removed before deletion.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{project.longDesc}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Class Range</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Grade {project.classMin} - {project.classMax}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.durationHrs ? `${project.durationHrs} hours` : 'Not specified'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Prerequisites</h4>
                {project.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">None specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Project Steps ({project.steps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.steps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{step.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
                        
                        {step.checklist.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium mb-2">Checklist:</h5>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              {step.checklist.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {item.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {step.resources.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Resources:</h5>
                            <div className="space-y-1">
                              {step.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {resource.title} ({resource.type})
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <span className="font-medium">{project._count.enrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Steps</span>
                </div>
                <span className="font-medium">{project._count.steps}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Level</h4>
                <Badge className={getLevelColor(project.level)}>
                  {project.level}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Guidance</h4>
                <Badge className={getGuidanceColor(project.guidance)}>
                  {project.guidance.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {project.subjects.map((subject) => (
                    <Badge key={subject.Subject.name} variant="secondary" className="text-xs">
                      {subject.Subject.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag.Tag.name} variant="outline" className="text-xs">
                      {tag.Tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <Badge key={tool.name} variant="outline" className="text-xs">
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Info */}
          {project.submission && (
            <Card>
              <CardHeader>
                <CardTitle>Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Type: </span>
                    <Badge variant="outline">{project.submission.type}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Instructions: </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.submission.instruction}
                    </p>
                  </div>
                  {project.submission.allowedTypes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Allowed Types: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.submission.allowedTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


