import { FastifyPluginAsync } from 'fastify'
import { adminGuard } from '../middlewares/admin'
import { AdminService } from '../services/admin.service'
import { prisma } from '../lib/prisma'

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Handle preflight OPTIONS requests
  fastify.options('/admin/login', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Login endpoint
  fastify.post('/admin/login', async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const { username, password } = request.body as { username: string; password: string }
      
      if (!username || !password) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Username and password are required'
        })
      }

      const result = await AdminService.login({ username, password })
      
      return {
        success: true,
        token: result.token,
        admin: result.admin
      }
    } catch (error) {
      return reply.status(401).send({
        type: 'https://docs/errors/auth',
        title: 'Authentication Failed',
        status: 401,
        detail: error instanceof Error ? error.message : 'Invalid credentials'
      })
    }
  })

  // Handle preflight OPTIONS request for verify
  fastify.options('/admin/verify', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Test endpoint without admin guard
  fastify.get('/admin/test', async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    return { ok: true, message: 'Admin test endpoint working' }
  })

  // Test endpoint with admin guard
  fastify.get('/admin/test-guard', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    return { ok: true, message: 'Admin test endpoint with guard working' }
  })

  // Verify token endpoint
  fastify.get('/admin/verify', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    return { ok: true }
  })

  // Logout endpoint (optional, mainly for consistency)
  fastify.post('/admin/logout', { preHandler: adminGuard }, async (request, reply) => {
    return { success: true, message: 'Logged out successfully' }
  })

  // Handle preflight OPTIONS request for stats
  fastify.options('/admin/stats', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Get admin stats
  fastify.get('/admin/stats', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const stats = await AdminService.getStats()
      return stats
    } catch (error) {
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to fetch admin stats'
      })
    }
  })

  // Handle preflight OPTIONS request for projects
  fastify.options('/admin/projects', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // List all projects for admin
  fastify.get('/admin/projects', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const { page = 1, pageSize = 20, search } = request.query as any
      const skip = (Number(page) - 1) * Number(pageSize)
      const take = Number(pageSize)

      const where = search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { shortDesc: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {}

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            subjects: { include: { Subject: true } },
            tags: { include: { Tag: true } },
            tools: true,
            _count: {
              select: {
                enrollments: true,
                steps: true
              }
            }
          }
        }),
        prisma.project.count({ where })
      ])

      return {
        projects,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          totalPages: Math.ceil(total / Number(pageSize))
        }
      }
    } catch (error) {
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to fetch projects'
      })
    }
  })

  // Get single project for admin
  fastify.get('/admin/projects/:id', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const { id } = request.params as { id: string }
      
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          subjects: { include: { Subject: true } },
          tags: { include: { Tag: true } },
          tools: true,
          steps: {
            orderBy: { order: 'asc' },
            include: {
              checklist: { orderBy: { order: 'asc' } },
              resources: true
            }
          },
          submission: true,
          _count: {
            select: {
              enrollments: true,
              steps: true
            }
          }
        }
      })

      if (!project) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Project Not Found',
          status: 404,
          detail: 'Project not found'
        })
      }

      return project
    } catch (error) {
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to fetch project'
      })
    }
  })

  // Delete project
  fastify.delete('/admin/projects/:id', { preHandler: adminGuard }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5000')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const { id } = request.params as { id: string }
      
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      })

      if (!project) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Project Not Found',
          status: 404,
          detail: 'Project not found'
        })
      }

      // Check if project has enrollments
      if (project._count.enrollments > 0) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Cannot Delete Project',
          status: 400,
          detail: 'Cannot delete project with existing enrollments'
        })
      }

      await prisma.project.delete({
        where: { id }
      })

      return { success: true, message: 'Project deleted successfully' }
    } catch (error) {
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to delete project'
      })
    }
  })
}


