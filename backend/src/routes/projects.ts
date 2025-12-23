import { FastifyPluginAsync } from 'fastify'
import { ProjectsQuerySchema, ProjectJsonSchema } from '../lib/zodSchemas'
import { ProjectService } from '../services/project.service'
import { adminGuard } from '../middlewares/admin'
import multipart from '@fastify/multipart'
import { parse as parseYaml } from 'yaml'

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  // Register multipart for file uploads
  await fastify.register(multipart)

  // Admin middleware is imported and applied via preHandler

  // List projects with filtering
  fastify.get('/projects', async (request, reply) => {
    // Add CORS headers manually to ensure consistency
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    const query = ProjectsQuerySchema.parse(request.query)
    const result = await ProjectService.listProjects(query)
    return result
  })

  // Get project by slug
  fastify.get<{ Params: { slug: string } }>('/projects/:slug', async (request, reply) => {
    // Add CORS headers manually to ensure consistency
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
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

  // Handle preflight OPTIONS request for import
  fastify.options('/projects/import', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Import project (Admin only) - File upload method
  fastify.post('/projects/import', {
    preHandler: adminGuard
  }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
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

      // Validate file type
      if (!data.filename?.endsWith('.json')) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Invalid File Type',
          status: 400,
          detail: 'Only JSON files are allowed for import'
        })
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (data.file.bytesRead > maxSize) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'File Too Large',
          status: 400,
          detail: 'File size exceeds 10MB limit'
        })
      }

      const buffer = await data.toBuffer()
      let jsonContent: any
      
      try {
        jsonContent = JSON.parse(buffer.toString())
      } catch (parseError) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Invalid JSON Format',
          status: 400,
          detail: 'The uploaded file contains invalid JSON syntax',
          errors: [{
            path: 'file',
            message: 'Invalid JSON syntax in uploaded file'
          }]
        })
      }
      
      // Validate with Zod and provide detailed error messages
      try {
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
      } catch (validationError: any) {
        if (validationError.name === 'ZodError') {
          const errors = validationError.errors.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
          
          return reply.status(400).send({
            type: 'https://docs/errors/validation',
            title: 'Validation Failed',
            status: 400,
            detail: 'The project data does not meet the required format',
            errors
          })
        }
        throw validationError
      }
      
    } catch (error) {
      // Log the error for debugging
      fastify.log.error(error)
      
      return reply.status(500).send({
        type: 'https://docs/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred during import'
      })
    }
  })

  // Handle preflight OPTIONS request for import-json
  fastify.options('/projects/import-json', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Alternative import method - Direct JSON upload
  fastify.post('/projects/import-json', {
    preHandler: adminGuard
  }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const jsonContent = request.body as any
      
      // Validate with Zod and provide detailed error messages
      try {
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
      } catch (validationError: any) {
        if (validationError.name === 'ZodError') {
          const errors = validationError.errors.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
          
          return reply.status(400).send({
            type: 'https://docs/errors/validation',
            title: 'Validation Failed',
            status: 400,
            detail: 'The project data does not meet the required format',
            errors
          })
        }
        throw validationError
      }
      
    } catch (error) {
      // Log the error for debugging
      fastify.log.error(error)
      
      return reply.status(500).send({
        type: 'https://docs/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred during import'
      })
    }
  })

  // Batch import multiple projects (Admin only)
  fastify.post('/projects/import-batch', {
    preHandler: adminGuard
  }, async (request, reply) => {
    // Add CORS headers manually
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
    reply.header('Access-Control-Allow-Credentials', 'true')
    
    try {
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'No File Provided',
          status: 400,
          detail: 'A YAML or JSON file containing an array of projects is required for batch import'
        })
      }

      // Validate file type - support YAML and JSON
      const filename = data.filename || ''
      const isYaml = filename.endsWith('.yaml') || filename.endsWith('.yml')
      const isJson = filename.endsWith('.json')
      
      if (!isYaml && !isJson) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Invalid File Type',
          status: 400,
          detail: 'Only YAML (.yaml, .yml) or JSON (.json) files are allowed for batch import'
        })
      }

      // Check file size (limit to 50MB for batch)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (data.file.bytesRead > maxSize) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'File Too Large',
          status: 400,
          detail: 'File size exceeds 50MB limit for batch import'
        })
      }

      const buffer = await data.toBuffer()
      const fileContent = buffer.toString()
      let parsedContent: any
      
      try {
        if (isYaml) {
          parsedContent = parseYaml(fileContent)
        } else {
          parsedContent = JSON.parse(fileContent)
        }
      } catch (parseError: any) {
        const formatName = isYaml ? 'YAML' : 'JSON'
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: `Invalid ${formatName} Format`,
          status: 400,
          detail: `The uploaded file contains invalid ${formatName} syntax${parseError.message ? `: ${parseError.message}` : ''}`
        })
      }

      // Validate that it's an array
      if (!Array.isArray(parsedContent)) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Invalid Batch Format',
          status: 400,
          detail: 'Batch import requires an array of project objects'
        })
      }

      const results = {
        successful: [] as any[],
        failed: [] as any[],
        total: parsedContent.length
      }

      // Process each project
      for (let i = 0; i < parsedContent.length; i++) {
        try {
          const validatedProject = ProjectJsonSchema.parse(parsedContent[i])
          const project = await ProjectService.importProject(validatedProject)
          
          results.successful.push({
            index: i,
            project: {
              id: project.id,
              slug: project.slug,
              title: project.title
            }
          })
        } catch (error: any) {
          let errorMessage = 'Unknown error'
          let errorDetails: any[] = []
          
          if (error.name === 'ZodError') {
            errorMessage = 'Validation failed'
            errorDetails = error.errors.map((err: any) => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          } else {
            errorMessage = error.message || 'Import failed'
          }
          
          results.failed.push({
            index: i,
            error: errorMessage,
            details: errorDetails,
            data: parsedContent[i]
          })
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: results.total,
          successful: results.successful.length,
          failed: results.failed.length
        }
      }
      
    } catch (error) {
      // Log the error for debugging
      fastify.log.error(error)
      
      return reply.status(500).send({
        type: 'https://docs/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred during batch import'
      })
    }
  })
}