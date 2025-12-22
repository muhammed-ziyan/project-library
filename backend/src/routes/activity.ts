import { FastifyPluginAsync } from 'fastify'
import { ActivityService, ActivityType } from '../services/activity.service'

export const activityRoutes: FastifyPluginAsync = async (fastify) => {
  // Log user activity (public endpoint with enrollment ID)
  fastify.post('/activity', async (request, reply) => {
    try {
      const { enrollmentId, activityType, metadata } = request.body as {
        enrollmentId: string
        activityType: ActivityType
        metadata?: any
      }

      if (!enrollmentId || !activityType) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'enrollmentId and activityType are required'
        })
      }

      // Verify enrollment exists
      const { prisma } = await import('../lib/prisma')
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId }
      })

      if (!enrollment) {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Enrollment Not Found',
          status: 404,
          detail: 'Invalid enrollment ID'
        })
      }

      await ActivityService.logActivity({
        enrollmentId,
        activityType,
        metadata
      })

      return { success: true }
    } catch (error) {
      fastify.log.error('Activity logging error: %s', error instanceof Error ? error.message : String(error))
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to log activity'
      })
    }
  })
}

