'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { enrollmentsAPI } from '@/lib/api'
import { StepSidebar } from '@/components/step-sidebar'
import { StepViewer } from '@/components/step-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StepWithProgressDTO, Level, GuidanceType } from '@/lib/types'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Users } from 'lucide-react'

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

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollmentId as string
  const [currentStepId, setCurrentStepId] = useState<string>('')

  const { data: enrollmentData, isLoading, error } = useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: () => enrollmentsAPI.get(enrollmentId),
  })

  // Set initial step when data loads
  useEffect(() => {
    if (enrollmentData?.stepsWithProgress && enrollmentData.stepsWithProgress.length > 0) {
      setCurrentStepId(enrollmentData.stepsWithProgress[0].step.id)
    }
  }, [enrollmentData])

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !enrollmentData) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
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
      </div>
    )
  }

  const { enrollment, project, stepsWithProgress } = enrollmentData
  const currentStep = stepsWithProgress.find(step => step.step.id === currentStepId)
  const currentStepIndex = stepsWithProgress.findIndex(step => step.step.id === currentStepId)
  
  const hasNextStep = currentStepIndex < stepsWithProgress.length - 1
  const hasPrevStep = currentStepIndex > 0

  const handleStepSelect = (stepId: string) => {
    setCurrentStepId(stepId)
  }

  const handleNextStep = () => {
    if (hasNextStep) {
      const nextStep = stepsWithProgress[currentStepIndex + 1]
      setCurrentStepId(nextStep.step.id)
    }
  }

  const handlePrevStep = () => {
    if (hasPrevStep) {
      const prevStep = stepsWithProgress[currentStepIndex - 1]
      setCurrentStepId(prevStep.step.id)
    }
  }

  // Calculate overall progress
  const totalChecklistItems = stepsWithProgress.reduce(
    (total, step) => total + step.checklist.length, 0
  )
  const completedChecklistItems = stepsWithProgress.reduce(
    (total, step) => total + step.checklist.filter(item => item.completed).length, 0
  )
  const overallProgress = totalChecklistItems > 0 
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
    : 0

  return (
    <div className="flex h-screen bg-background">
      {/* Step Sidebar */}
      <StepSidebar
        steps={stepsWithProgress}
        currentStepId={currentStepId}
        onStepSelect={handleStepSelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{project.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={levelColors[project.level]}>
                      {project.level}
                    </Badge>
                    <Badge variant="outline" className={guidanceColors[project.guidance]}>
                      {project.guidance.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {completedChecklistItems} of {totalChecklistItems} tasks completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep ? (
          <StepViewer
            step={currentStep}
            enrollmentId={enrollmentId}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            hasNextStep={hasNextStep}
            hasPrevStep={hasPrevStep}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Steps Available</h3>
                  <p className="text-muted-foreground">
                    This project doesn't have any steps defined yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
