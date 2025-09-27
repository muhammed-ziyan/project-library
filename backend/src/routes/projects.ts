import { FastifyPluginAsync } from 'fastify'
import { ProjectsQuerySchema, ProjectJsonSchema } from '../lib/zodSchemas'
import { ProjectService } from '../services/project.service'
import multipart from '@fastify/multipart'

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  // Register multipart for file uploads
  await fastify.register(multipart)

  // Admin middleware for protected routes
  const adminGuard = async (request: any, reply: any) => {
    const adminKey = request.headers['x-admin-key']
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return reply.status(401).send({
        type: 'https://docs/errors/auth',
        title: 'Unauthorized',
        status: 401,
        detail: 'Admin access required'
      })
    }
  }

  // List projects with filtering
  fastify.get('/projects', async (request, reply) => {
    const query = ProjectsQuerySchema.parse(request.query)
    const result = await ProjectService.listProjects(query)
    return result
  })

  // Get project by slug
  fastify.get<{ Params: { slug: string } }>('/projects/:slug', async (request, reply) => {
    const { slug } = request.params
    const project = await ProjectService.getProjectBySlug(slug)
    
    if (!project) {
      return reply.status(404).send({
        type: 'https://docs/errors/not-found',
        title: 'Project Not Found',
        status: 404,
        detail: `Project with slug '${slug}' does not exist`
      })
    }
    
    return project
  })

  // Import project (Admin only)
  fastify.post('/projects/import', {
    preHandler: adminGuard
  }, async (request, reply) => {
    try {
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'No File Provided',
          status: 400,
          detail: 'A JSON file is required for import'
        })
      }

      const buffer = await data.toBuffer()
      const jsonContent = JSON.parse(buffer.toString())
      
      // Validate with Zod
      const validatedProject = ProjectJsonSchema.parse(jsonContent)
      
      // Import the project
      const project = await ProjectService.importProject(validatedProject)
      
      return {
        success: true,
        project: {
          id: project.id,
          slug: project.slug,
          title: project.title
        }
      }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Invalid JSON',
          status: 400,
          detail: 'The uploaded file contains invalid JSON'
        })
      }
      throw error
    }
  })
}