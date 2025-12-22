'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  FileText,
  LogIn,
  Eye,
  Play,
  Square,
  Clock
} from 'lucide-react'

interface Activity {
  id: string
  activityType: string
  metadata: any
  createdAt: string
}

interface UserActivityLogProps {
  activities: Activity[]
  limit?: number
  showMetadata?: boolean
}

const activityTypeConfig: Record<string, {
  label: string
  icon: React.ReactNode
  badgeColor: string
}> = {
  ENROLLMENT_CREATED: {
    label: 'Enrolled',
    icon: <LogIn className="h-4 w-4" />,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  PAGE_VIEW: {
    label: 'Page View',
    icon: <Eye className="h-4 w-4" />,
    badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  STEP_COMPLETED: {
    label: 'Step Completed',
    icon: <CheckCircle2 className="h-4 w-4" />,
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  CHECKLIST_COMPLETED: {
    label: 'Checklist Item',
    icon: <CheckCircle2 className="h-4 w-4" />,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
  },
  SUBMISSION_CREATED: {
    label: 'Submission',
    icon: <FileText className="h-4 w-4" />,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  SESSION_START: {
    label: 'Session Start',
    icon: <Play className="h-4 w-4" />,
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
  },
  SESSION_END: {
    label: 'Session End',
    icon: <Square className="h-4 w-4" />,
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function UserActivityLog({ activities, limit, showMetadata = false }: UserActivityLogProps) {
  const displayedActivities = limit ? activities.slice(0, limit) : activities

  if (displayedActivities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No activity recorded yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity, index) => {
        const config = activityTypeConfig[activity.activityType] || {
          label: activity.activityType.replace(/_/g, ' '),
          icon: <Clock className="h-4 w-4" />,
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }

        return (
          <Card key={activity.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {config.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge className={`${config.badgeColor} border-0`}>
                        {config.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>

                  {/* Metadata */}
                  {showMetadata && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {activity.metadata.projectSlug && (
                        <div>Project: <span className="font-medium">{activity.metadata.projectSlug}</span></div>
                      )}
                      {activity.metadata.page && (
                        <div>Page: <span className="font-medium">{activity.metadata.page}</span></div>
                      )}
                      {activity.metadata.stepId && (
                        <div>Step ID: <span className="font-mono text-xs">{activity.metadata.stepId}</span></div>
                      )}
                      {activity.metadata.checklistId && (
                        <div>Checklist ID: <span className="font-mono text-xs">{activity.metadata.checklistId}</span></div>
                      )}
                      {activity.metadata.submissionType && (
                        <div>Type: <span className="font-medium">{activity.metadata.submissionType}</span></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline connector */}
              {index < displayedActivities.length - 1 && (
                <div className="ml-6 mt-2 mb-2 border-l-2 border-gray-200 dark:border-gray-700 h-2" />
              )}
            </CardContent>
          </Card>
        )
      })}

      {limit && activities.length > limit && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {limit} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}

