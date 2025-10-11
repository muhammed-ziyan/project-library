import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export interface AdminLoginData {
  username: string
  password: string
}

export interface AdminUser {
  id: string
  username: string
  createdAt: Date
}

export class AdminService {
  static async login(loginData: AdminLoginData): Promise<{ token: string; admin: AdminUser }> {
    const { username, password } = loginData

    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt
      }
    }
  }

  static async verifyToken(token: string): Promise<AdminUser> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Verify admin still exists
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId }
      })

      if (!admin) {
        throw new Error('Admin not found')
      }

      return {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  static async createAdmin(username: string, password: string): Promise<AdminUser> {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      throw new Error('Admin with this username already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash
      }
    })

    return {
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt
    }
  }

  static async getStats() {
    const [totalProjects, totalEnrollments, totalSubmissions] = await Promise.all([
      prisma.project.count(),
      prisma.enrollment.count(),
      prisma.submission.count()
    ])

    return {
      totalProjects,
      totalEnrollments,
      totalSubmissions
    }
  }
}
