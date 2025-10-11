'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { enrollmentsAPI } from '@/lib/api'
import { SubmissionForm } from '@/components/submission-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react'

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const guidanceColors = {
  FULLY_GUIDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SEMI_GUIDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  UNGUIDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export default function SubmitPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollmentId as string

  const { data: enrollmentData, isLoading, error } = useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: () => enrollmentsAPI.get(enrollmentId),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading submission details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !enrollmentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Enrollment Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The enrollment you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/browse">Browse Projects</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { enrollment, project } = enrollmentData

  // Check if project has submission requirements
  if (!project.submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Submission Required</h2>
              <p className="text-muted-foreground mb-4">
                This project doesn't require a formal submission. You can continue learning or browse other projects.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <a href={`/learn/${enrollmentId}`}>Continue Learning</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/browse">Browse Projects</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
            <p className="text-xl text-muted-foreground">{project.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Badge className={levelColors[project.level]}>
            {project.level}
          </Badge>
          <Badge variant="outline" className={guidanceColors[project.guidance]}>
            {project.guidance.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Submission Form */}
      <div className="max-w-2xl mx-auto">
        <SubmissionForm
          enrollmentId={enrollmentId}
          submissionType={project.submission.type}
          instruction={project.submission.instruction}
          allowedTypes={project.submission.allowedTypes}
        />
      </div>

      {/* Help Section */}
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Having trouble with your submission? Here are some tips:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">For Link Submissions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Make sure your project is publicly accessible</li>
                <li>• Test the link before submitting</li>
                <li>• Include a brief description in your project</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">For File Submissions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Compress large files into a ZIP archive</li>
                <li>• Include a README file with instructions</li>
                <li>• Make sure all required files are included</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">For Text Submissions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Describe what you built and learned</li>
                <li>• Include any challenges you faced</li>
                <li>• Mention any future improvements you'd make</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
