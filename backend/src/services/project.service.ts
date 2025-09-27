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
    const projectCards = projects.map(project => ({
      slug: project.slug,
      title: project.title,
      shortDesc: project.shortDesc,
      classMin: project.classMin,
      classMax: project.classMax,
      level: project.level,
      guidance: project.guidance,
      tags: project.tags.map(t => t.Tag.name),
      subjects: project.subjects.map(s => s.Subject.name)
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
      subjects: project.subjects.map(s => s.Subject.name),
      tags: project.tags.map(t => t.Tag.name),
      tools: project.tools.map(t => t.name),
      prerequisites: project.prerequisites,
      durationHrs: project.durationHrs,
      steps: project.steps.map(step => ({
        id: step.id,
        order: step.order,
        title: step.title,
        description: step.description
      })),
      submission: project.submission ? {
        type: project.submission.type,
        instruction: project.submission.instruction,
        allowedTypes: project.submission.allowedTypes
      } : undefined
    }
  }
  
  static async importProject(projectData: any) {
    const mappedData = await ProjectMapper.mapJsonToDb(projectData)
    
    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: mappedData,
      create: mappedData
    })
    
    return project
  }
}