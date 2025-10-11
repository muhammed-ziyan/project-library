import 'dotenv/config'
import fastify from 'fastify'
import { corsPlugin } from './middlewares/cors'
import { errorHandler } from './middlewares/errorHandler'
import { healthRoutes } from './routes/health'
import { projectRoutes } from './routes/projects'
import { adminRoutes } from './routes/admin'
import { enrollmentRoutes } from './routes/enrollments'
import { submissionRoutes } from './routes/submissions'
import { stepRoutes } from './routes/steps'

const server = fastify({ logger: true })

// Register plugins
server.register(corsPlugin)

// Set error handler
server.setErrorHandler(errorHandler)

// Register routes
server.register(healthRoutes)
server.register(projectRoutes)
server.register(adminRoutes)
server.register(enrollmentRoutes)
server.register(submissionRoutes)
server.register(stepRoutes)

// Serve static files for uploaded submissions
import path from 'path'
const storageRoot = path.join(process.cwd(), 'storage', 'projects')
server.register(require('@fastify/static'), {
  root: storageRoot,
  prefix: '/files/'
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    const host = '0.0.0.0'
    
    await server.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()