import { prisma } from '../lib/prisma'

export interface UserListQuery {
  page?: number
  pageSize?: number
  search?: string
  projectId?: string
  classNum?: number
  completionStatus?: 'all' | 'completed' | 'in_progress' | 'not_started'
  startDate?: Date
  endDate?: Date
}

export interface UserDetailResponse {
  enrollment: {
    id: string
    email: string
    name: string | null
    school: string | null
    classNum: number
    createdAt: Date
    lastActivityAt: Date | null
    completedAt: Date | null
    timeSpentMinutes: number | null
  }
  project: {
    id: string
    slug: string
    title: string
    shortDesc: string
    level: string
    guidance: string
    totalSteps: number
  }
  progress: {
    completedSteps: number
    totalSteps: number
    completionPercentage: number
    completedChecklists: number
    totalChecklists: number
  }
  submissions: Array<{
    id: string
    urlOrText: string
    createdAt: Date
  }>
  recentActivity: Array<{
    id: string
    activityType: string
    metadata: any
    createdAt: Date
  }>
}

export class UserService {
  /**
   * List all enrollments/users with filters and pagination
   */
  static async listUsers(query: UserListQuery) {
    const {
      page = 1,
      pageSize = 20,
      search,
      projectId,
      classNum,
      completionStatus = 'all',
      startDate,
      endDate
    } = query

    const skip = (page - 1) * pageSize
    const take = pageSize

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { school: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Project filter
    if (projectId) {
      where.projectId = projectId
    }

    // Class filter
    if (classNum) {
      where.classNum = classNum
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    // Completion status filter
    if (completionStatus === 'completed') {
      where.completedAt = { not: null }
    } else if (completionStatus === 'in_progress') {
      where.AND = [
        { completedAt: null },
        { lastActivityAt: { not: null } }
      ]
    } else if (completionStatus === 'not_started') {
      where.lastActivityAt = null
    }

    // Fetch enrollments with related data
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          Project: {
            select: {
              id: true,
              slug: true,
              title: true,
              level: true,
              guidance: true
            }
          },
          _count: {
            select: {
              progress: true,
              submissions: true
            }
          }
        }
      }),
      prisma.enrollment.count({ where })
    ])

    // Compute activity counts separately (avoids relying on Enrollment._count.activities,
    // which can break if Prisma Client wasn't regenerated after schema changes).
    const enrollmentIds = enrollments.map(e => e.id)
    const activitiesByEnrollmentId = new Map<string, number>()
    if (enrollmentIds.length > 0) {
      const groups = await prisma.userActivity.groupBy({
        by: ['enrollmentId'],
        where: { enrollmentId: { in: enrollmentIds } },
        _count: { _all: true }
      })
      for (const g of groups) {
        activitiesByEnrollmentId.set(g.enrollmentId, g._count._all)
      }
    }

    // Calculate progress for each enrollment
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total steps and checklists for the project
        const steps = await prisma.step.findMany({
          where: { projectId: enrollment.projectId },
          include: {
            checklist: true
          }
        })

        const totalSteps = steps.length
        const totalChecklists = steps.reduce((sum, step) => sum + step.checklist.length, 0)

        // Get completed progress
        const completedProgress = await prisma.enrollmentProgress.findMany({
          where: {
            enrollmentId: enrollment.id,
            completed: true
          }
        })

        const completedSteps = new Set(
          completedProgress.filter(p => !p.checklistId).map(p => p.stepId)
        ).size

        const completedChecklists = completedProgress.filter(p => p.checklistId).length

        const completionPercentage = totalSteps > 0 
          ? Math.round((completedSteps / totalSteps) * 100)
          : 0

        return {
          ...enrollment,
          _count: {
            ...(enrollment as any)._count,
            activities: activitiesByEnrollmentId.get(enrollment.id) ?? 0
          },
          progress: {
            completedSteps,
            totalSteps,
            completionPercentage,
            completedChecklists,
            totalChecklists
          }
        }
      })
    )

    return {
      users: enrichedEnrollments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  /**
   * Get detailed user information
   */
  static async getUserDetail(enrollmentId: string): Promise<UserDetailResponse | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        Project: {
          include: {
            steps: {
              orderBy: { order: 'asc' },
              include: {
                checklist: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        progress: {
          orderBy: { updatedAt: 'desc' }
        },
        submissions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!enrollment) {
      return null
    }

    const recentActivities = await prisma.userActivity.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const totalSteps = enrollment.Project.steps.length
    const totalChecklists = enrollment.Project.steps.reduce(
      (sum, step) => sum + step.checklist.length,
      0
    )

    const completedProgress = enrollment.progress.filter(p => p.completed)
    const completedSteps = new Set(
      completedProgress.filter(p => !p.checklistId).map(p => p.stepId)
    ).size
    const completedChecklists = completedProgress.filter(p => p.checklistId).length

    const completionPercentage = totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0

    return {
      enrollment: {
        id: enrollment.id,
        email: enrollment.email,
        name: enrollment.name,
        school: enrollment.school,
        classNum: enrollment.classNum,
        createdAt: enrollment.createdAt,
        lastActivityAt: enrollment.lastActivityAt,
        completedAt: enrollment.completedAt,
        timeSpentMinutes: enrollment.timeSpentMinutes
      },
      project: {
        id: enrollment.Project.id,
        slug: enrollment.Project.slug,
        title: enrollment.Project.title,
        shortDesc: enrollment.Project.shortDesc,
        level: enrollment.Project.level,
        guidance: enrollment.Project.guidance,
        totalSteps
      },
      progress: {
        completedSteps,
        totalSteps,
        completionPercentage,
        completedChecklists,
        totalChecklists
      },
      submissions: enrollment.submissions.map(sub => ({
        id: sub.id,
        urlOrText: sub.urlOrText,
        createdAt: sub.createdAt
      })),
      recentActivity: recentActivities.map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        createdAt: activity.createdAt
      }))
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(enrollmentId: string, limit: number = 100) {
    const activities = await prisma.userActivity.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null
    }))
  }

  /**
   * Export users data (for CSV/Excel)
   */
  static async exportUsers(query: UserListQuery) {
    // Get all users matching the query without pagination
    const { users } = await this.listUsers({
      ...query,
      page: 1,
      pageSize: 10000 // Large number to get all
    })

    // Transform to flat structure for export
    return users.map(user => ({
      email: user.email,
      name: user.name || '',
      school: user.school || '',
      class: user.classNum,
      project: user.Project.title,
      projectSlug: user.Project.slug,
      enrolledAt: user.createdAt.toISOString(),
      lastActivity: user.lastActivityAt?.toISOString() || '',
      completedAt: user.completedAt?.toISOString() || '',
      timeSpentMinutes: user.timeSpentMinutes || 0,
      completionPercentage: user.progress.completionPercentage,
      completedSteps: user.progress.completedSteps,
      totalSteps: user.progress.totalSteps,
      submissions: user._count.submissions,
      activities: user._count.activities
    }))
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      completedUsers,
      averageTimeSpent
    ] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: {
          lastActivityAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.enrollment.count({
        where: {
          completedAt: { not: null }
        }
      }),
      prisma.enrollment.aggregate({
        _avg: {
          timeSpentMinutes: true
        }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      completedUsers,
      completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0,
      averageTimeSpentMinutes: Math.round(averageTimeSpent._avg.timeSpentMinutes || 0)
    }
  }
}

