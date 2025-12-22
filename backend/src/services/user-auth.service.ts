import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { EnrollmentService } from './enrollment.service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d' // 7 days

export interface RegisterData {
  enrollmentId: string
  phoneNumber: string
  password: string
  name?: string
  school?: string
  classNum?: number
}

export interface LoginData {
  phoneNumber: string
  password: string
}

export interface UserInfo {
  id: string
  phoneNumber: string
  email: string | null
  name: string | null
  school: string | null
  classNum: number | null
  createdAt: Date
}

export class UserAuthService {
  /**
   * Register a new user account using an enrollment
   */
  static async register(data: RegisterData): Promise<{ token: string; user: UserInfo }> {
    const { enrollmentId, phoneNumber, password, name, school, classNum } = data

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })

    if (!enrollment) {
      throw new Error('Enrollment not found')
    }

    // Check if user with this phone number already exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber }
    })

    if (user) {
      throw new Error('User account already exists for this phone number. Please login instead.')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user account
    user = await prisma.user.create({
      data: {
        phoneNumber,
        email: enrollment.email,
        passwordHash,
        name: name || enrollment.name,
        school: school || enrollment.school,
        classNum: classNum || enrollment.classNum
      }
    })

    // Link all enrollments with this email to the user
    await prisma.enrollment.updateMany({
      where: { email: enrollment.email },
      data: { userId: user.id }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        school: user.school,
        classNum: user.classNum,
        createdAt: user.createdAt
      }
    }
  }

  /**
   * Login with phone number and password
   */
  static async login(data: LoginData): Promise<{ token: string; user: UserInfo }> {
    const { phoneNumber, password } = data

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    })

    if (!user) {
      throw new Error('Invalid phone number or password')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid phone number or password')
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        school: user.school,
        classNum: user.classNum,
        createdAt: user.createdAt
      }
    }
  }

  /**
   * Get user profile with enrollments
   */
  static async getUserProfile(userId: string) {
    // First, ensure user has only one enrollment (keep latest)
    const allEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { Group: true },
      orderBy: { createdAt: 'desc' }
    })

    // If user has more than one enrollment, keep only the latest
    if (allEnrollments.length > 1) {
      const keepEnrollment = allEnrollments[0] // Latest enrollment
      const toDelete = allEnrollments.slice(1) // Older enrollments

      // Delete older enrollments and clean up groups
      for (const enrollment of toDelete) {
        // Use centralized cascade delete (handles progress/submissions/activities + group cleanup)
        await EnrollmentService.deleteEnrollment(enrollment.id, userId)
      }
    }

    // Now fetch user with remaining enrollments
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            Project: {
              select: {
                id: true,
                slug: true,
                title: true,
                shortDesc: true,
                level: true,
                guidance: true
              }
            },
            Group: true,
            progress: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      user.enrollments.map(async (enrollment) => {
        // Get total steps for the project
        const steps = await prisma.step.findMany({
          where: { projectId: enrollment.projectId }
        })

        const totalSteps = steps.length
        const completedProgress = enrollment.progress.filter(p => p.completed && !p.checklistId)
        const completedSteps = new Set(completedProgress.map(p => p.stepId)).size
        const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

        return {
          id: enrollment.id,
          project: enrollment.Project,
          enrolledAt: enrollment.createdAt,
          lastActivityAt: enrollment.lastActivityAt,
          completedAt: enrollment.completedAt,
          group: enrollment.Group ? {
            id: enrollment.Group.id,
            teamLeaderId: enrollment.Group.teamLeaderId,
            secondMemberName: enrollment.Group.secondMemberName,
            secondMemberEmail: enrollment.Group.secondMemberEmail,
            secondMemberPhoneNumber: enrollment.Group.secondMemberPhoneNumber,
            secondMemberSchool: enrollment.Group.secondMemberSchool,
            secondMemberClassNum: enrollment.Group.secondMemberClassNum
          } : null,
          progress: {
            completedSteps,
            totalSteps,
            completionPercentage
          }
        }
      })
    )

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        school: user.school,
        classNum: user.classNum,
        createdAt: user.createdAt
      },
      enrollments: enrollmentsWithProgress
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<UserInfo> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phoneNumber: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        school: user.school,
        classNum: user.classNum,
        createdAt: user.createdAt
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}

