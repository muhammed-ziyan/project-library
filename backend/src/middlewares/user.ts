import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface UserPayload {
  userId: string
  phoneNumber: string
}

export async function userGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = (request.headers['authorization'] || request.headers['Authorization']) as string | undefined

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      type: 'https://docs/errors/auth',
      title: 'Unauthorized',
      status: 401,
      detail: 'User authentication required. Please provide a valid Bearer token.'
    })
  }

  try {
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    
    // Attach user info to request for use in route handlers
    ;(request as any).user = decoded
  } catch (error) {
    return reply.status(401).send({
      type: 'https://docs/errors/auth',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired token'
    })
  }
}

