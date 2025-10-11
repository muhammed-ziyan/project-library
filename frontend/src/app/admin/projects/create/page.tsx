'use client'

import { useAdminAuth } from '@/lib/admin-auth'
import { ProjectForm } from '@/components/project-form'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateProject() {
  const { token } = useAdminAuth()
  const router = useRouter()

  const handleSuccess = (project: any) => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add a new project to the library
          </p>
        </div>
      </div>

      {/* Project Form */}
      <ProjectForm
        token={token}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode="create"
      />
    </div>
  )
}
