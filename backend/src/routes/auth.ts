import { FastifyPluginAsync } from 'fastify'
import { UserAuthService } from '../services/user-auth.service'
import { userGuard } from '../middlewares/user'
import { PhoneNumberSchema } from '../lib/zodSchemas'

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Handle preflight OPTIONS requests
  fastify.options('/auth/register', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  fastify.options('/auth/login', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  fastify.options('/auth/me', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
    return reply.status(200).send()
  })

  // Register endpoint
  fastify.post('/auth/register', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const { enrollmentId, phoneNumber, password, name, school, classNum } = request.body as any

      if (!enrollmentId || !phoneNumber || !password) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Enrollment ID, phone number, and password are required'
        })
      }

      // Validate phone number format
      try {
        PhoneNumberSchema.parse(phoneNumber)
      } catch (validationError: any) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: validationError.errors?.[0]?.message || 'Invalid phone number format. Please use international format (e.g., +1234567890)'
        })
      }

      const result = await UserAuthService.register({
        enrollmentId,
        phoneNumber,
        password,
        name,
        school,
        classNum
      })

      return {
        success: true,
        token: result.token,
        user: result.user
      }
    } catch (error) {
      fastify.log.error('Registration error: %s', error instanceof Error ? error.message : String(error))
      return reply.status(400).send({
        type: 'https://docs/errors/registration',
        title: 'Registration Failed',
        status: 400,
        detail: error instanceof Error ? error.message : 'Failed to create account'
      })
    }
  })

  // Login endpoint
  fastify.post('/auth/login', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const { phoneNumber, password } = request.body as any

      if (!phoneNumber || !password) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Phone number and password are required'
        })
      }

      // Validate phone number format
      try {
        PhoneNumberSchema.parse(phoneNumber)
      } catch (validationError: any) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: validationError.errors?.[0]?.message || 'Invalid phone number format. Please use international format (e.g., +1234567890)'
        })
      }

      const result = await UserAuthService.login({ phoneNumber, password })

      return {
        success: true,
        token: result.token,
        user: result.user
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

  // Get user profile (requires authentication)
  fastify.get('/auth/me', { preHandler: userGuard }, async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    try {
      const user = (request as any).user
      const profile = await UserAuthService.getUserProfile(user.userId)
      return profile
    } catch (error: any) {
      fastify.log.error('Profile fetch error:', error)
      return reply.status(500).send({
        type: 'https://docs/errors/server',
        title: 'Server Error',
        status: 500,
        detail: error.message || 'Failed to fetch user profile'
      })
    }
  })
}

