'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { StepWithProgressDTO } from '@/lib/types'
import { CheckCircle, ExternalLink, ChevronLeft, ChevronRight, BookOpen, Video, FileText, Code, Database } from 'lucide-react'

interface StepViewerProps {
  step: StepWithProgressDTO
  enrollmentId: string
  onNextStep?: () => void
  onPrevStep?: () => void
  hasNextStep: boolean
  hasPrevStep: boolean
}

const resourceIcons = {
  video: Video,
  article: FileText,
  notebook: Code,
  dataset: Database,
  code: Code,
}

export function StepViewer({ 
  step, 
  enrollmentId, 
  onNextStep, 
  onPrevStep, 
  hasNextStep, 
  hasPrevStep 
}: StepViewerProps) {
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const checklistMutation = useMutation({
    mutationFn: ({ checklistId, completed }: { checklistId: string; completed: boolean }) =>
      enrollmentsAPI.updateChecklist(enrollmentId, { checklistId, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] })
    },
  })

  const stepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      enrollmentsAPI.updateStep(enrollmentId, { stepId, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] })
    },
  })

  const handleChecklistToggle = async (checklistId: string, completed: boolean) => {
    setIsUpdating(checklistId)
    try {
      await checklistMutation.mutateAsync({ checklistId, completed })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleStepToggle = async (completed: boolean) => {
    setIsUpdating('step')
    try {
      await stepMutation.mutateAsync({ stepId: step.step.id, completed })
    } finally {
      setIsUpdating(null)
    }
  }

  const getResourceIcon = (type: string) => {
    const IconComponent = resourceIcons[type as keyof typeof resourceIcons] || ExternalLink
    return <IconComponent className="h-4 w-4" />
  }

  const completedChecklistItems = step.checklist.filter(item => item.completed).length
  const totalChecklistItems = step.checklist.length
  const isStepComplete = totalChecklistItems > 0 ? completedChecklistItems === totalChecklistItems : false

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Step {step.step.order}</Badge>
            {isStepComplete && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">{step.step.title}</h1>
          <p className="text-muted-foreground text-lg">{step.step.description}</p>
        </div>

        {/* Step Completion Toggle */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="step-complete"
                checked={isStepComplete}
                onCheckedChange={handleStepToggle}
                disabled={isUpdating === 'step'}
              />
              <label htmlFor="step-complete" className="text-sm font-medium cursor-pointer">
                Mark this step as complete
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        {step.checklist.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Checklist
                <Badge variant="outline">
                  {completedChecklistItems}/{totalChecklistItems}
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete these tasks to finish this step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {step.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        handleChecklistToggle(item.id, checked as boolean)
                      }
                      disabled={isUpdating === item.id}
                    />
                    <label 
                      htmlFor={item.id} 
                      className={`text-sm cursor-pointer flex-1 ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        {step.resources.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Resources
              </CardTitle>
              <CardDescription>
                Helpful materials for this step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {step.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {resource.type} • {new URL(resource.url).hostname}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevStep}
            disabled={!hasPrevStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Step
          </Button>
          
          <Button
            onClick={onNextStep}
            disabled={!hasNextStep}
          >
            Next Step
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
