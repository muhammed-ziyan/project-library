import { FastifyPluginAsync } from 'fastify'
import multipart from '@fastify/multipart'
import { SubmissionCreateSchema } from '../lib/zodSchemas'
import { prisma } from '../lib/prisma'
import { storage } from '../lib/storage'

export const submissionRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart)

  // Create submission
  fastify.post<{ Params: { id: string } }>('/enrollments/:id/submissions', async (request, reply) => {
    const { id: enrollmentId } = request.params
    
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        Project: {
          include: {
            submission: true
          }
        }
      }
    })
    
    if (!enrollment) {
      return reply.status(404).send({
        type: 'https://docs/errors/not-found',
        title: 'Enrollment Not Found',
        status: 404,
        detail: `Enrollment with id '${enrollmentId}' does not exist`
      })
    }
    
    if (!enrollment.Project.submission) {
      return reply.status(400).send({
        type: 'https://docs/errors/validation',
        title: 'No Submission Required',
        status: 400,
        detail: 'This project does not require a submission'
      })
    }
    
    const submissionSpec = enrollment.Project.submission
    let submissionContent = ''
    
    if (submissionSpec.type === 'FILE') {
      // Handle file upload
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({
          type: 'https://docs/errors/validation',
          title: 'No File Provided',
          status: 400,
          detail: 'A file is required for this submission type'
        })
      }
      
      // Check file type if allowed types are specified
      const allowedTypes = JSON.parse(submissionSpec.allowedTypes || '[]')
      if (allowedTypes.length > 0) {
        const fileExtension = data.filename?.split('.').pop()?.toLowerCase()
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return reply.status(400).send({
            type: 'https://docs/errors/validation',
            title: 'Invalid File Type',
            status: 400,
            detail: `File type '${fileExtension}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
          })
        }
      }
      
      const buffer = await data.toBuffer()
      const filename = await storage.saveFile(buffer, data.filename || 'submission')
      submissionContent = storage.getFileUrl(filename)
      
    } else {
      // Handle LINK or TEXT submission
      const data = SubmissionCreateSchema.parse(request.body)
      submissionContent = data.urlOrText
    }
    
    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        enrollmentId,
        urlOrText: submissionContent
      }
    })
    
    return {
      submissionId: submission.id,
      success: true
    }
  })

  // List submissions for enrollment
  fastify.get<{ Params: { id: string } }>('/enrollments/:id/submissions', async (request, reply) => {
    const { id: enrollmentId } = request.params
    
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })
    
    if (!enrollment) {
      return reply.status(404).send({
        type: 'https://docs/errors/not-found',
        title: 'Enrollment Not Found',
        status: 404,
        detail: `Enrollment with id '${enrollmentId}' does not exist`
      })
    }
    
    const submissions = await prisma.submission.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' }
    })
    
    return {
      submissions: submissions.map((s: any) => ({
        id: s.id,
        urlOrText: s.urlOrText,
        createdAt: s.createdAt
      }))
    }
  })
}