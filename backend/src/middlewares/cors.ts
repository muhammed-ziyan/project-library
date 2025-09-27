import fastifyCors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'

export const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyCors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['http://localhost:3000', 'http://localhost:5000']
      : true,
    credentials: true
  })
}