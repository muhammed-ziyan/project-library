import { ProjectJson } from './zodSchemas'
import { prisma } from './prisma'

export class ProjectMapper {
  static async mapJsonToDb(projectData: ProjectJson) {
    // Upsert subjects
    const subjectIds = await Promise.all(
      projectData.subjects.map(async (subjectName) => {
        const subject = await prisma.subject.upsert({
          where: { name: subjectName },
          update: {},
          create: { name: subjectName }
        })
        return subject.id
      })
    )

    // Upsert tags
    const tagIds = await Promise.all(
      projectData.tags.map(async (tagName) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        })
        return tag.id
      })
    )

    // Prepare project data for upsert
    const projectCreateData = {
      slug: projectData.slug,
      title: projectData.title,
      shortDesc: projectData.shortDesc,
      longDesc: projectData.longDesc,
      classMin: projectData.classRange.min,
      classMax: projectData.classRange.max,
      level: projectData.level,
      guidance: projectData.guidance,
      prerequisites: JSON.stringify(projectData.prerequisites),
      durationHrs: projectData.durationHrs,
      sourceJson: JSON.stringify(projectData),
      subjects: {
        create: subjectIds.map(subjectId => ({ subjectId }))
      },
      tags: {
        create: tagIds.map(tagId => ({ tagId }))
      },
      tools: {
        create: projectData.tools.map(tool => ({ name: tool }))
      },
      steps: {
        create: projectData.steps.map(step => ({
          order: step.order,
          title: step.title,
          description: step.description,
          checklist: {
            create: step.checklist.map(item => ({
              order: item.order,
              text: item.text
            }))
          },
          resources: {
            create: step.resources.map(resource => ({
              title: resource.title,
              url: resource.url,
              type: resource.type
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
              instruction: projectData.submission.instruction,
              allowedTypes: JSON.stringify(projectData.submission.allowedTypes)
            }
          }
        }
      : projectCreateData

    return finalProjectData
  }
}