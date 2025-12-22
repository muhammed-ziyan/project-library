import { prisma } from '../lib/prisma'

export interface AnalyticsOverview {
  users: {
    total: number
    active: number
    completed: number
    completionRate: number
  }
  engagement: {
    averageTimeSpent: number
    totalSessions: number
    averageSessionsPerUser: number
  }
  projects: {
    totalProjects: number
    averageEnrollmentsPerProject: number
  }
  submissions: {
    total: number
    averagePerUser: number
  }
}

export interface UserEngagementMetrics {
  dailyActiveUsers: Array<{ date: string; count: number }>
  weeklyActiveUsers: Array<{ week: string; count: number }>
  monthlyActiveUsers: Array<{ month: string; count: number }>
  userGrowth: Array<{ date: string; cumulative: number; new: number }>
}

export interface ProjectPerformanceMetrics {
  projects: Array<{
    projectId: string
    projectSlug: string
    projectTitle: string
    totalEnrollments: number
    completedEnrollments: number
    completionRate: number
    averageTimeSpent: number
    averageCompletionPercentage: number
  }>
}

export interface TrendAnalytics {
  enrollmentTrends: Array<{ date: string; count: number }>
  completionTrends: Array<{ date: string; count: number }>
  activityTrends: Array<{ date: string; count: number }>
  submissionTrends: Array<{ date: string; count: number }>
}

export class AnalyticsService {
  /**
   * Get overall system analytics overview
   */
  static async getOverview(): Promise<AnalyticsOverview> {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeUsers,
      completedUsers,
      avgTimeSpent,
      totalProjects,
      totalSubmissions,
      totalSessions
    ] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: {
          lastActivityAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.enrollment.count({
        where: {
          completedAt: { not: null }
        }
      }),
      prisma.enrollment.aggregate({
        _avg: { timeSpentMinutes: true }
      }),
      prisma.project.count(),
      prisma.submission.count(),
      prisma.userActivity.count({
        where: {
          activityType: 'SESSION_START'
        }
      })
    ])

    const enrollmentsPerProject = totalProjects > 0 ? totalUsers / totalProjects : 0
    const submissionsPerUser = totalUsers > 0 ? totalSubmissions / totalUsers : 0
    const sessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        completed: completedUsers,
        completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0
      },
      engagement: {
        averageTimeSpent: Math.round(avgTimeSpent._avg.timeSpentMinutes || 0),
        totalSessions,
        averageSessionsPerUser: Math.round(sessionsPerUser * 10) / 10
      },
      projects: {
        totalProjects,
        averageEnrollmentsPerProject: Math.round(enrollmentsPerProject * 10) / 10
      },
      submissions: {
        total: totalSubmissions,
        averagePerUser: Math.round(submissionsPerUser * 10) / 10
      }
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagementMetrics(days: number = 30): Promise<UserEngagementMetrics> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Daily active users
    const dailyActive = await this.getDailyActiveUsers(startDate, endDate)

    // Weekly active users
    const weeklyActive = await this.getWeeklyActiveUsers(startDate, endDate)

    // Monthly active users
    const monthlyActive = await this.getMonthlyActiveUsers(startDate, endDate)

    // User growth
    const userGrowth = await this.getUserGrowth(startDate, endDate)

    return {
      dailyActiveUsers: dailyActive,
      weeklyActiveUsers: weeklyActive,
      monthlyActiveUsers: monthlyActive,
      userGrowth
    }
  }

  /**
   * Get project performance metrics
   */
  static async getProjectPerformanceMetrics(): Promise<ProjectPerformanceMetrics> {
    const projects = await prisma.project.findMany({
      include: {
        enrollments: {
          select: {
            id: true,
            completedAt: true,
            timeSpentMinutes: true,
            progress: {
              where: { completed: true }
            }
          }
        },
        steps: true
      }
    })

    const projectMetrics = await Promise.all(
      projects.map(async (project) => {
        const totalEnrollments = project.enrollments.length
        const completedEnrollments = project.enrollments.filter(e => e.completedAt).length
        const completionRate = totalEnrollments > 0
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0

        const timeSpentValues = project.enrollments
          .map(e => e.timeSpentMinutes || 0)
          .filter(t => t > 0)
        const averageTimeSpent = timeSpentValues.length > 0
          ? Math.round(timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length)
          : 0

        const totalSteps = project.steps.length
        const completionPercentages = project.enrollments.map(enrollment => {
          const completedSteps = new Set(
            enrollment.progress.filter(p => !p.checklistId).map(p => p.stepId)
          ).size
          return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
        })

        const averageCompletionPercentage = completionPercentages.length > 0
          ? Math.round(completionPercentages.reduce((a, b) => a + b, 0) / completionPercentages.length)
          : 0

        return {
          projectId: project.id,
          projectSlug: project.slug,
          projectTitle: project.title,
          totalEnrollments,
          completedEnrollments,
          completionRate,
          averageTimeSpent,
          averageCompletionPercentage
        }
      })
    )

    return {
      projects: projectMetrics.sort((a, b) => b.totalEnrollments - a.totalEnrollments)
    }
  }

  /**
   * Get trend analytics
   */
  static async getTrendAnalytics(days: number = 30): Promise<TrendAnalytics> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const [enrollmentTrends, completionTrends, activityTrends, submissionTrends] = await Promise.all([
      this.getEnrollmentTrends(startDate, endDate),
      this.getCompletionTrends(startDate, endDate),
      this.getActivityTrends(startDate, endDate),
      this.getSubmissionTrends(startDate, endDate)
    ])

    return {
      enrollmentTrends,
      completionTrends,
      activityTrends,
      submissionTrends
    }
  }

  // Helper methods for metrics calculation

  private static async getDailyActiveUsers(startDate: Date, endDate: Date) {
    const activities = await prisma.userActivity.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        enrollmentId: true,
        createdAt: true
      }
    })

    const dailyCounts: Record<string, Set<string>> = {}

    activities.forEach(activity => {
      const date = activity.createdAt.toISOString().split('T')[0]
      if (!dailyCounts[date]) {
        dailyCounts[date] = new Set()
      }
      dailyCounts[date].add(activity.enrollmentId)
    })

    return Object.entries(dailyCounts)
      .map(([date, users]) => ({ date, count: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getWeeklyActiveUsers(startDate: Date, endDate: Date) {
    const activities = await prisma.userActivity.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        enrollmentId: true,
        createdAt: true
      }
    })

    const weeklyCounts: Record<string, Set<string>> = {}

    activities.forEach(activity => {
      const week = this.getWeekKey(activity.createdAt)
      if (!weeklyCounts[week]) {
        weeklyCounts[week] = new Set()
      }
      weeklyCounts[week].add(activity.enrollmentId)
    })

    return Object.entries(weeklyCounts)
      .map(([week, users]) => ({ week, count: users.size }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }

  private static async getMonthlyActiveUsers(startDate: Date, endDate: Date) {
    const activities = await prisma.userActivity.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        enrollmentId: true,
        createdAt: true
      }
    })

    const monthlyCounts: Record<string, Set<string>> = {}

    activities.forEach(activity => {
      const month = activity.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyCounts[month]) {
        monthlyCounts[month] = new Set()
      }
      monthlyCounts[month].add(activity.enrollmentId)
    })

    return Object.entries(monthlyCounts)
      .map(([month, users]) => ({ month, count: users.size }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private static async getUserGrowth(startDate: Date, endDate: Date) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const dailyNew: Record<string, number> = {}
    enrollments.forEach(enrollment => {
      const date = enrollment.createdAt.toISOString().split('T')[0]
      dailyNew[date] = (dailyNew[date] || 0) + 1
    })

    let cumulative = 0
    const growth = Object.entries(dailyNew)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, newCount]) => {
        cumulative += newCount
        return { date, cumulative, new: newCount }
      })

    return growth
  }

  private static async getEnrollmentTrends(startDate: Date, endDate: Date) {
    const enrollments = await prisma.enrollment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    const dailyCounts: Record<string, number> = {}
    enrollments.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + item._count
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getCompletionTrends(startDate: Date, endDate: Date) {
    const completions = await prisma.enrollment.findMany({
      where: {
        completedAt: {
          gte: startDate,
          lte: endDate,
          not: null
        }
      },
      select: {
        completedAt: true
      }
    })

    const dailyCounts: Record<string, number> = {}
    completions.forEach(item => {
      if (item.completedAt) {
        const date = item.completedAt.toISOString().split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      }
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getActivityTrends(startDate: Date, endDate: Date) {
    const activities = await prisma.userActivity.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    const dailyCounts: Record<string, number> = {}
    activities.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + item._count
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getSubmissionTrends(startDate: Date, endDate: Date) {
    const submissions = await prisma.submission.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    const dailyCounts: Record<string, number> = {}
    submissions.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + item._count
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const firstDayOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    return `${year}-W${String(weekNumber).padStart(2, '0')}`
  }
}

