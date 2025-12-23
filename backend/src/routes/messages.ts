import { FastifyPluginAsync } from 'fastify'
import { MessageService } from '../services/message.service'
import { userGuard } from '../middlewares/user'

export const messageRoutes: FastifyPluginAsync = async (fastify) => {
  // Handle preflight OPTIONS requests
  fastify.options('/me/messages', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  fastify.options('/me/messages/unread-count', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  fastify.options('/me/messages/:id/read', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Get user messages
  fastify.get('/me/messages', { preHandler: userGuard }, async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const user = (request as any).user
      const { page = 1, pageSize = 20 } = request.query as any

      const result = await MessageService.getUserMessages(
        user.userId,
        Number(page),
        Number(pageSize)
      )

      return result
    } catch (error) {
      fastify.log.error('Get messages error: %s', error instanceof Error ? error.message : String(error))
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to fetch messages'
      })
    }
  })

  // Get unread message count
  fastify.get('/me/messages/unread-count', { preHandler: userGuard }, async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const user = (request as any).user
      const result = await MessageService.getUnreadCount(user.userId)
      return result
    } catch (error) {
      fastify.log.error('Get unread count error: %s', error instanceof Error ? error.message : String(error))
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to fetch unread count'
      })
    }
  })

  // Mark message as read
  fastify.post('/me/messages/:id/read', { preHandler: userGuard }, async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const user = (request as any).user
      const { id } = request.params as { id: string }

      const result = await MessageService.markAsRead(id, user.userId)
      return result
    } catch (error) {
      if (error instanceof Error && error.message === 'Message not found') {
        return reply.status(404).send({
          type: 'https://docs/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: 'Message not found'
        })
      }

      if (error instanceof Error && error.message === 'Access denied') {
        return reply.status(403).send({
          type: 'https://docs/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Access denied'
        })
      }

      fastify.log.error('Mark as read error: %s', error instanceof Error ? error.message : String(error))
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: 'Failed to mark message as read'
      })
    }
  })
}

