import { FastifyRequest, FastifyReply } from 'fastify'
import { ActivityService, ActivityType } from '../services/activity.service'

/**
 * Middleware to track activity after successful request
 * Note: This middleware should be used as a preHandler that tracks activity
 * after the route handler completes. For proper tracking, use logActivity helper
 * directly in route handlers or use a postHandler pattern.
 */
export const activityTracker = (activityType: ActivityType) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Store original send method to track after response
    const originalSend = reply.send.bind(reply)
    
    reply.send = function(payload: any): FastifyReply {
      // Track activity after successful response (2xx status codes)
      if (reply.statusCode >= 200 && reply.statusCode < 300) {
        try {
          // Extract enrollmentId from request body or params
          const enrollmentId = 
            (request.body as any)?.enrollmentId || 
            (request.params as any)?.enrollmentId ||
            (request.params as any)?.id

          if (enrollmentId) {
            // Log activity asynchronously (don't block response)
            ActivityService.logActivity({
              enrollmentId,
              activityType,
              metadata: {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString()
              }
            }).catch(error => {
              console.error('Failed to log activity:', error)
            })
          }
        } catch (error) {
          // Silently fail - don't break the request
          console.error('Activity tracking error:', error)
        }
      }
      
      return originalSend(payload)
    }
  }
}

/**
 * Helper to log activity directly (for use in route handlers)
 */
export async function logActivity(
  enrollmentId: string,
  activityType: ActivityType,
  metadata?: any
) {
  try {
    await ActivityService.logActivity({
      enrollmentId,
      activityType,
      metadata
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

