import { prisma } from '../lib/prisma'
import { ProjectsQuery } from '../lib/zodSchemas'
import { ProjectMapper } from '../lib/mappers'

export class ProjectService {
  static async listProjects(query: ProjectsQuery) {
    const { class: classNum, subject, tags, level, guidance, q, page, pageSize } = query
    
    let whereClause: any = {}
    
    // Class filter
    if (classNum) {
      whereClause.classMin = { lte: classNum }
      whereClause.classMax = { gte: classNum }
    }
    
    // Level filter
    if (level) {
      whereClause.level = level
    }
    
    // Guidance filter
    if (guidance) {
      whereClause.guidance = guidance
    }
    
    // Subject filter
    if (subject) {
      whereClause.subjects = {
        some: {
          Subject: {
            name: {
              contains: subject,
              mode: 'insensitive'
            }
          }
        }
      }
    }
    
    // Tags filter
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim())
      whereClause.tags = {
        some: {
          Tag: {
            name: {
              in: tagList
            }
          }
        }
      }
    }
    
    // Search filter
    if (q) {
      whereClause.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          shortDesc: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          subjects: {
            some: {
              Subject: {
                name: {
                  contains: q,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        {
          tags: {
            some: {
              Tag: {
                name: {
                  contains: q,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ]
    }
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          subjects: {
            include: {
              Subject: true
            }
          },
          tags: {
            include: {
              Tag: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.project.count({
        where: whereClause
      })
    ])
    
    // Transform to DTO format
    const projectCards = projects.map((project: any) => ({
      slug: project.slug,
      title: project.title,
      shortDesc: project.shortDesc,
      classMin: project.classMin,
      classMax: project.classMax,
      level: project.level,
      guidance: project.guidance,
      tags: project.tags.map((t: any) => t.Tag.name),
      subjects: project.subjects.map((s: any) => s.Subject.name)
    }))
    
    return {
      data: projectCards,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
  
  static async getProjectBySlug(slug: string) {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        subjects: {
          include: {
            Subject: true
          }
        },
        tags: {
          include: {
            Tag: true
          }
        },
        tools: true,
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        submission: true
      }
    })
    
    if (!project) {
      return null
    }
    
    // Transform to detailed DTO
    return {
      slug: project.slug,
      title: project.title,
      shortDesc: project.shortDesc,
      longDesc: project.longDesc,
      classMin: project.classMin,
      classMax: project.classMax,
      level: project.level,
      guidance: project.guidance,
      subjects: project.subjects.map((s: any) => s.Subject.name),
      tags: project.tags.map((t: any) => t.Tag.name),
      tools: project.tools.map((t: any) => t.name),
      prerequisites: (() => {
        try {
          return JSON.parse(project.prerequisites || '[]')
        } catch (error) {
          console.warn(`Invalid JSON in prerequisites for project ${project.slug}:`, project.prerequisites)
          return []
        }
      })(),
      durationHrs: project.durationHrs,
      steps: project.steps.map((step: any) => ({
        id: step.id,
        order: step.order,
        title: step.title,
        description: step.description
      })),
      submission: project.submission ? {
        type: project.submission.type,
        instruction: project.submission.instruction,
        allowedTypes: (() => {
          try {
            return JSON.parse(project.submission.allowedTypes || '[]')
          } catch (error) {
            console.warn(`Invalid JSON in allowedTypes for project ${project.slug}:`, project.submission.allowedTypes)
            return []
          }
        })()
      } : undefined
    }
  }
  
  static async importProject(projectData: any) {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: projectData.slug }
    })
    
    if (existingProject) {
      // Delete existing relations in correct order (child records first)
      // First delete checklist items and resources (they reference steps)
      const steps = await prisma.step.findMany({
        where: { projectId: existingProject.id },
        select: { id: true }
      })
      
      for (const step of steps) {
        await prisma.checklistItem.deleteMany({
          where: { stepId: step.id }
        })
        await prisma.resource.deleteMany({
          where: { stepId: step.id }
        })
      }
      
      // Then delete steps
      await prisma.step.deleteMany({
        where: { projectId: existingProject.id }
      })
      
      // Delete other relations
      await prisma.projectSubject.deleteMany({
        where: { projectId: existingProject.id }
      })
      await prisma.projectTag.deleteMany({
        where: { projectId: existingProject.id }
      })
      await prisma.tool.deleteMany({
        where: { projectId: existingProject.id }
      })
      await prisma.submissionSpec.deleteMany({
        where: { projectId: existingProject.id }
      })
    }
    
    const mappedData = await ProjectMapper.mapJsonToDb(projectData)
    
    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: mappedData,
      create: mappedData
    })
    
    return project
  }
}