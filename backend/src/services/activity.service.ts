import { prisma } from '../lib/prisma'

export enum ActivityType {
  ENROLLMENT_CREATED = 'ENROLLMENT_CREATED',
  PAGE_VIEW = 'PAGE_VIEW',
  STEP_COMPLETED = 'STEP_COMPLETED',
  CHECKLIST_COMPLETED = 'CHECKLIST_COMPLETED',
  SUBMISSION_CREATED = 'SUBMISSION_CREATED',
  SESSION_START = 'SESSION_START',
  SESSION_END = 'SESSION_END'
}

export interface ActivityMetadata {
  [key: string]: any
}

export interface LogActivityData {
  enrollmentId: string
  activityType: ActivityType
  metadata?: ActivityMetadata
}

export interface ActivityQuery {
  enrollmentId?: string
  activityType?: ActivityType
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export class ActivityService {
  /**
   * Log a user activity
   */
  static async logActivity(data: LogActivityData) {
    const { enrollmentId, activityType, metadata } = data

    // Create activity record
    const activity = await prisma.userActivity.create({
      data: {
        enrollmentId,
        activityType,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Update enrollment's lastActivityAt
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { lastActivityAt: new Date() }
    })

    return activity
  }

  /**
   * Get activities with optional filters
   */
  static async getActivities(query: ActivityQuery) {
    const {
      enrollmentId,
      activityType,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = query

    const where: any = {}

    if (enrollmentId) {
      where.enrollmentId = enrollmentId
    }

    if (activityType) {
      where.activityType = activityType
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          Enrollment: {
            select: {
              email: true,
              name: true,
              Project: {
                select: {
                  title: true,
                  slug: true
                }
              }
            }
          }
        }
      }),
      prisma.userActivity.count({ where })
    ])

    // Parse metadata JSON
    const activitiesWithParsedMetadata = activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null
    }))

    return {
      activities: activitiesWithParsedMetadata,
      total,
      limit,
      offset
    }
  }

  /**
   * Get activity summary for an enrollment
   */
  static async getEnrollmentActivitySummary(enrollmentId: string) {
    const activities = await prisma.userActivity.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'asc' }
    })

    // Count activities by type
    const activityCounts: Record<string, number> = {}
    activities.forEach(activity => {
      activityCounts[activity.activityType] = (activityCounts[activity.activityType] || 0) + 1
    })

    // Calculate time spent (rough estimate based on session activities)
    let totalMinutes = 0
    let sessionStart: Date | null = null

    for (const activity of activities) {
      if (activity.activityType === ActivityType.SESSION_START) {
        sessionStart = activity.createdAt
      } else if (activity.activityType === ActivityType.SESSION_END && sessionStart) {
        const sessionEnd = activity.createdAt
        const duration = (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)
        totalMinutes += duration
        sessionStart = null
      }
    }

    // Update enrollment timeSpentMinutes
    if (totalMinutes > 0) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { timeSpentMinutes: Math.round(totalMinutes) }
      })
    }

    return {
      activityCounts,
      totalActivities: activities.length,
      timeSpentMinutes: Math.round(totalMinutes),
      firstActivity: activities[0]?.createdAt || null,
      lastActivity: activities[activities.length - 1]?.createdAt || null
    }
  }

  /**
   * Calculate time spent for all enrollments
   */
  static async calculateAllTimeSpent() {
    const enrollments = await prisma.enrollment.findMany({
      select: { id: true }
    })

    const results = []

    for (const enrollment of enrollments) {
      try {
        const summary = await this.getEnrollmentActivitySummary(enrollment.id)
        results.push({
          enrollmentId: enrollment.id,
          timeSpentMinutes: summary.timeSpentMinutes
        })
      } catch (error) {
        console.error(`Failed to calculate time for enrollment ${enrollment.id}:`, error)
      }
    }

    return results
  }

  /**
   * Get recent activities across all enrollments
   */
  static async getRecentActivities(limit: number = 20) {
    const activities = await prisma.userActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        Enrollment: {
          select: {
            email: true,
            name: true,
            Project: {
              select: {
                title: true,
                slug: true
              }
            }
          }
        }
      }
    })

    return activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null
    }))
  }

  /**
   * Mark project as completed for an enrollment
   */
  static async markProjectCompleted(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        Project: {
          select: {
            title: true
          }
        }
      }
    })

    if (!enrollment) {
      throw new Error('Enrollment not found')
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { completedAt: new Date() }
    })

    // Log completion activity
    await this.logActivity({
      enrollmentId,
      activityType: ActivityType.STEP_COMPLETED,
      metadata: { completed: true }
    })

    // Send congratulations message if user exists
    if (enrollment.userId) {
      try {
        const { MessageService } = await import('./message.service')
        await MessageService.createSystemMessage({
          title: 'Congratulations on Completing Your Project!',
          content: `You've successfully completed "${enrollment.Project.title}". Well done! Keep up the great work.`,
          recipientId: enrollment.userId
        })
      } catch (error) {
        // Log but don't fail completion if message fails
        console.error('Failed to create completion message:', error)
      }
    }
  }
}

