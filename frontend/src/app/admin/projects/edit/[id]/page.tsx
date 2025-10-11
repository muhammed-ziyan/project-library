'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'
import { projectsAPI } from '@/lib/api'
import { ProjectForm } from '@/components/project-form'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProject({ params }: EditProjectPageProps) {
  const { token } = useAdminAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token && params.id) {
      fetchProject()
    }
  }, [token, params.id])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const projectData = await projectsAPI.getAdminProject(token!, params.id)
      
      // Transform backend data to form structure
      const transformedData = {
        id: projectData.id,
        slug: projectData.slug,
        title: projectData.title,
        shortDesc: projectData.shortDesc,
        longDesc: projectData.longDesc,
        classRange: {
          min: projectData.classMin,
          max: projectData.classMax
        },
        level: projectData.level,
        guidance: projectData.guidance,
        subjects: projectData.subjects.map((s: any) => s.Subject.name),
        tags: projectData.tags.map((t: any) => t.Tag.name),
        tools: projectData.tools.map((t: any) => t.name),
        prerequisites: projectData.prerequisites ? JSON.parse(projectData.prerequisites) : [],
        durationHrs: projectData.durationHrs,
        steps: projectData.steps.map((step: any) => ({
          order: step.order,
          title: step.title,
          description: step.description,
          checklist: step.checklist.map((item: any) => ({
            order: item.order,
            text: item.text
          })),
          resources: step.resources.map((resource: any) => ({
            title: resource.title,
            url: resource.url,
            type: resource.type
          }))
        })),
        submission: projectData.submission ? {
          type: projectData.submission.type,
          instruction: projectData.submission.instruction,
          allowedTypes: projectData.submission.allowedTypes ? JSON.parse(projectData.submission.allowedTypes) : []
        } : undefined
      }
      
      setProject(transformedData)
    } catch (error) {
      console.error('Failed to fetch project:', error)
      setError('Failed to load project data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (updatedProject: any) => {
    // Redirect to project management page
    router.push('/admin/projects/manage')
  }

  const handleCancel = () => {
    router.push('/admin/projects/manage')
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/projects/manage">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/admin/projects/manage">
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/projects/manage">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/admin/projects/manage">
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/projects/manage">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update project information
          </p>
        </div>
      </div>

      {/* Project Form */}
      <ProjectForm
        token={token}
        initialData={project}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode="edit"
      />
    </div>
  )
}
