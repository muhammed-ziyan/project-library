import { ProjectJson } from './zodSchemas'
import { prisma } from './prisma'

export class ProjectMapper {
  static async mapJsonToDb(projectData: ProjectJson) {
    try {
      // Validate and sanitize subjects
      const validSubjects = projectData.subjects.filter(name => name && typeof name === 'string' && name.trim())
      if (validSubjects.length === 0) {
        throw new Error('At least one valid subject is required')
      }

      // Upsert subjects
      const subjectIds = await Promise.all(
        validSubjects.map(async (subjectName) => {
          const trimmedName = subjectName.trim()
          const subject = await prisma.subject.upsert({
            where: { name: trimmedName },
            update: {},
            create: { name: trimmedName }
          })
          return subject.id
        })
      )

      // Validate and sanitize tags
      const validTags = (projectData.tags || []).filter(name => name && typeof name === 'string' && name.trim())
      
      // Upsert tags
      const tagIds = await Promise.all(
        validTags.map(async (tagName) => {
          const trimmedName = tagName.trim()
          const tag = await prisma.tag.upsert({
            where: { name: trimmedName },
            update: {},
            create: { name: trimmedName }
          })
          return tag.id
        })
      )

      // Validate and sanitize tools
      const validTools = (projectData.tools || []).filter(tool => tool && typeof tool === 'string' && tool.trim())
      
      // Validate steps
      if (!Array.isArray(projectData.steps) || projectData.steps.length === 0) {
        throw new Error('At least one step is required')
      }

      // Prepare project data for upsert
      const projectCreateData = {
        slug: projectData.slug.trim(),
        title: projectData.title.trim(),
        shortDesc: projectData.shortDesc.trim(),
        longDesc: projectData.longDesc.trim(),
        classMin: Math.max(1, Math.min(12, projectData.classRange.min)),
        classMax: Math.max(1, Math.min(12, projectData.classRange.max)),
        level: projectData.level,
        guidance: projectData.guidance,
        prerequisites: JSON.stringify(projectData.prerequisites || []),
        durationHrs: projectData.durationHrs || null,
        sourceJson: JSON.stringify(projectData),
        subjects: {
          create: subjectIds.map(subjectId => ({ subjectId }))
        },
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        },
        tools: {
          create: validTools.map(tool => ({ name: tool.trim() }))
        },
        steps: {
          create: projectData.steps.map((step, index) => ({
            order: step.order || index + 1,
            title: step.title.trim(),
            description: step.description.trim(),
            checklist: {
              create: (step.checklist || []).map((item, itemIndex) => ({
                order: item.order || itemIndex + 1,
                text: item.text.trim()
              }))
            },
            resources: {
              create: (step.resources || []).map(resource => ({
                title: resource.title.trim(),
                url: resource.url.trim(),
                type: resource.type.trim() || 'link'
              }))
            }
          }))
        }
      }

      // Handle submission spec if provided
      const finalProjectData = projectData.submission 
        ? {
            ...projectCreateData,
            submission: {
              create: {
                type: projectData.submission.type,
                instruction: projectData.submission.instruction.trim(),
                allowedTypes: JSON.stringify(projectData.submission.allowedTypes || [])
              }
            }
          }
        : projectCreateData

      return finalProjectData
    } catch (error) {
      console.error('Error in ProjectMapper.mapJsonToDb:', error)
      throw new Error(`Failed to map project data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}