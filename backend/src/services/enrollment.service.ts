import { prisma } from '../lib/prisma'
import { EnrollmentCreate, ChecklistUpdate, StepUpdate } from '../lib/zodSchemas'

export class EnrollmentService {
  static async createEnrollment(data: EnrollmentCreate) {
    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug: data.projectSlug }
    })
    
    if (!project) {
      throw new Error(`Project with slug '${data.projectSlug}' not found`)
    }
    
    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        projectId: project.id,
        email: data.email,
        name: data.name,
        school: data.school,
        classNum: data.classNum
      }
    })
    
    return {
      enrollmentId: enrollment.id,
      projectSlug: project.slug
    }
  }
  
  static async getEnrollmentDetail(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        Project: {
          include: {
            steps: {
              include: {
                checklist: {
                  orderBy: {
                    order: 'asc'
                  }
                },
                resources: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        progress: true
      }
    })
    
    if (!enrollment) {
      return null
    }
    
    // Build progress map
    const progressMap = new Map<string, boolean>()
    const checklistProgressMap = new Map<string, boolean>()
    
    enrollment.progress.forEach((p: any) => {
      progressMap.set(p.stepId, p.completed)
      if (p.checklistId) {
        checklistProgressMap.set(p.checklistId, p.completed)
      }
    })
    
    // Transform to DTO format
    const stepsWithProgress = enrollment.Project.steps.map((step: any) => ({
      step: {
        id: step.id,
        order: step.order,
        title: step.title,
        description: step.description
      },
      checklist: step.checklist.map((item: any) => ({
        id: item.id,
        order: item.order,
        text: item.text,
        completed: checklistProgressMap.get(item.id) || false
      })),
      resources: step.resources.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        type: resource.type
      }))
    }))
    
    return {
      enrollment: {
        id: enrollment.id,
        projectSlug: enrollment.Project.slug,
        email: enrollment.email,
        classNum: enrollment.classNum
      },
      project: {
        title: enrollment.Project.title,
        level: enrollment.Project.level,
        guidance: enrollment.Project.guidance
      },
      stepsWithProgress
    }
  }
  
  static async updateChecklistItem(enrollmentId: string, data: ChecklistUpdate) {
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })
    
    if (!enrollment) {
      throw new Error('Enrollment not found')
    }
    
    // Get step ID from checklist item
    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id: data.checklistId }
    })
    
    if (!checklistItem) {
      throw new Error('Checklist item not found')
    }
    
    // Find existing progress or create new
    const existingProgress = await prisma.enrollmentProgress.findFirst({
      where: {
        enrollmentId,
        checklistId: data.checklistId
      }
    })
    
    if (existingProgress) {
      await prisma.enrollmentProgress.update({
        where: { id: existingProgress.id },
        data: { completed: data.completed }
      })
    } else {
      await prisma.enrollmentProgress.create({
        data: {
          enrollmentId,
          stepId: checklistItem.stepId,
          checklistId: data.checklistId,
          completed: data.completed
        }
      })
    }
    
    return { success: true }
  }
  
  static async updateStepCompletion(enrollmentId: string, data: StepUpdate) {
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })
    
    if (!enrollment) {
      throw new Error('Enrollment not found')
    }
    
    // Find existing progress or create new
    const existingProgress = await prisma.enrollmentProgress.findFirst({
      where: {
        enrollmentId,
        stepId: data.stepId,
        checklistId: null // Step-level progress has no checklist ID
      }
    })
    
    if (existingProgress) {
      await prisma.enrollmentProgress.update({
        where: { id: existingProgress.id },
        data: { completed: data.completed }
      })
    } else {
      await prisma.enrollmentProgress.create({
        data: {
          enrollmentId,
          stepId: data.stepId,
          completed: data.completed
        }
      })
    }
    
    return { success: true }
  }

  /**
   * Delete an enrollment and all related data (cascade delete)
   * Also handles group cleanup if the enrollment was part of a group
   */
  static async deleteEnrollment(enrollmentId: string, userId: string) {
    // Verify enrollment exists and belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { Group: true }
    })

    if (!enrollment) {
      throw new Error('Enrollment not found')
    }

    // Verify ownership (if enrollment has userId field)
    // Note: The schema shows email but code references userId - checking both
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { enrollments: true }
    })

    if (user && !user.enrollments.some(e => e.id === enrollmentId)) {
      throw new Error('Access denied: Enrollment does not belong to user')
    }

    const groupId = (enrollment as any).groupId || (enrollment as any).Group?.id

    // Delete dependent rows first (FK constraints)
    await prisma.enrollmentProgress.deleteMany({ where: { enrollmentId } })
    await prisma.submission.deleteMany({ where: { enrollmentId } })
    
    // Delete activities if UserActivity model exists
    try {
      await (prisma as any).userActivity.deleteMany({ where: { enrollmentId } })
    } catch (error) {
      // UserActivity might not exist, ignore
    }

    // Delete enrollment
    await prisma.enrollment.delete({ where: { id: enrollmentId } })

    // Clean up group if no enrollments remain
    if (groupId) {
      const remaining = await prisma.enrollment.count({ 
        where: { groupId: groupId as string } 
      })
      if (remaining === 0) {
        try {
          await (prisma as any).group.delete({ where: { id: groupId } })
        } catch (error) {
          // Group might not exist or already deleted, ignore
        }
      }
    }

    return { success: true }
  }
}