import { FastifyPluginAsync } from 'fastify'
import { EnrollmentCreateSchema } from '../lib/zodSchemas'
import { EnrollmentService } from '../services/enrollment.service'

export const enrollmentRoutes: FastifyPluginAsync = async (fastify) => {
  // Create enrollment
  fastify.post('/enrollments', async (request, reply) => {
    const data = EnrollmentCreateSchema.parse(request.body)
    
    try {
      const result = await EnrollmentService.createEnrollment(data)
      return result
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Project Not Found',
          status: 404,
          detail: error.message
        })
      }
      throw error
    }
  })

  // Get enrollment detail
  fastify.get<{ Params: { id: string } }>('/enrollments/:id', async (request, reply) => {
    const { id } = request.params
    const result = await EnrollmentService.getEnrollmentDetail(id)
    
    if (!result) {
      return reply.status(404).send({
        type: 'https://docs/errors/not-found',
        title: 'Enrollment Not Found',
        status: 404,
        detail: `Enrollment with id '${id}' does not exist`
      })
    }
    
    return result
  })

}