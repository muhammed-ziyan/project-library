import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.error(error)

  if (error instanceof ZodError) {
    return reply.status(400).send({
      type: 'https://docs/errors/validation',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid input data',
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    })
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      type: 'https://docs/errors/client',
      title: error.message || 'Client Error',
      status: error.statusCode,
      detail: error.message || 'A client error occurred'
    })
  }

  // Server error
  return reply.status(500).send({
    type: 'https://docs/errors/server',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred'
  })
}