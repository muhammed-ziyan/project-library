import { FastifyPluginAsync } from 'fastify'
import { ChecklistUpdateSchema, StepUpdateSchema } from '../lib/zodSchemas'
import { EnrollmentService } from '../services/enrollment.service'

export const stepRoutes: FastifyPluginAsync = async (fastify) => {
  // Update checklist item (moved from enrollments for dedicated steps API)
  fastify.patch<{ Params: { enrollmentId: string } }>('/enrollments/:enrollmentId/checklist', async (request, reply) => {
    const { enrollmentId } = request.params
    const data = ChecklistUpdateSchema.parse(request.body)
    
    try {
      const result = await EnrollmentService.updateChecklistItem(enrollmentId, data)
      return result
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Enrollment Not Found',
          status: 404,
          detail: error.message
        })
      }
      throw error
    }
  })

  // Update step completion (moved from enrollments for dedicated steps API)
  fastify.patch<{ Params: { enrollmentId: string } }>('/enrollments/:enrollmentId/step', async (request, reply) => {
    const { enrollmentId } = request.params
    const data = StepUpdateSchema.parse(request.body)
    
    try {
      const result = await EnrollmentService.updateStepCompletion(enrollmentId, data)
      return result
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Enrollment Not Found',
          status: 404,
          detail: error.message
        })
      }
      throw error
    }
  })
}