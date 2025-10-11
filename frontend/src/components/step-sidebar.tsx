'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StepWithProgressDTO } from '@/lib/types'
import { CheckCircle, Circle, ChevronRight } from 'lucide-react'

interface StepSidebarProps {
  steps: StepWithProgressDTO[]
  currentStepId: string
  onStepSelect: (stepId: string) => void
}

export function StepSidebar({ steps, currentStepId, onStepSelect }: StepSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getStepProgress = (step: StepWithProgressDTO) => {
    if (step.checklist.length === 0) return 0
    const completed = step.checklist.filter(item => item.completed).length
    return Math.round((completed / step.checklist.length) * 100)
  }

  const getStepStatus = (step: StepWithProgressDTO) => {
    const progress = getStepProgress(step)
    if (progress === 100) return 'completed'
    if (progress > 0) return 'in-progress'
    return 'not-started'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Circle className="h-4 w-4 text-yellow-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-16 bg-background border-r">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-background border-r">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Steps</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step)
            const progress = getStepProgress(step)
            const isActive = step.step.id === currentStepId

            return (
              <div
                key={step.step.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onStepSelect(step.step.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Step {step.step.order}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(status)}`}
                      >
                        {status === 'completed' ? 'Complete' : 
                         status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium mb-1 line-clamp-2">
                      {step.step.title}
                    </h3>
                    {step.checklist.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{progress}% complete</span>
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div
                              className="bg-current h-1 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span>
                          {step.checklist.filter(item => item.completed).length} of {step.checklist.length} tasks
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
