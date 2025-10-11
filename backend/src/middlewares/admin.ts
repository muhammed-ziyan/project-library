import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { AdminService } from '../services/admin.service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = (request.headers['authorization'] || request.headers['Authorization']) as string | undefined

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      type: 'https://docs/errors/auth',
      title: 'Unauthorized',
      status: 401,
      detail: 'Admin access required. Please provide a valid Bearer token.'
    })
  }

  try {
    // Extract token from Bearer header
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const admin = await AdminService.verifyToken(token)
    
    // Attach admin info to request for use in route handlers
    ;(request as any).admin = admin
  } catch (error) {
    return reply.status(401).send({
      type: 'https://docs/errors/auth',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired token'
    })
  }
}


