// Shared types matching the backend schema
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type GuidanceType = 'FULLY_GUIDED' | 'SEMI_GUIDED' | 'UNGUIDED'
export type SubmissionType = 'LINK' | 'FILE' | 'TEXT'

export interface ProjectCardDTO {
  slug: string
  title: string
  shortDesc: string
  classMin: number
  classMax: number
  level: Level
  guidance: GuidanceType
  tags: string[]
  subjects: string[]
}

export interface ProjectDetailDTO extends ProjectCardDTO {
  longDesc: string
  prerequisites: string[]
  tools: string[]
  durationHrs?: number
  steps: Array<{
    id: string
    order: number
    title: string
    description: string
  }>
  submission?: {
    type: SubmissionType
    instruction: string
    allowedTypes: string[]
  }
}

export interface EnrollmentDTO {
  id: string
  projectSlug: string
  email: string
  classNum: number
}

export interface StepWithProgressDTO {
  step: {
    id: string
    order: number
    title: string
    description: string
  }
  checklist: Array<{
    id: string
    order: number
    text: string
    completed: boolean
  }>
  resources: Array<{
    id: string
    title: string
    url: string
    type: string
  }>
}

export interface EnrollmentDetailDTO {
  enrollment: EnrollmentDTO
  project: {
    title: string
    level: Level
    guidance: GuidanceType
    submission?: {
      type: SubmissionType
      instruction: string
      allowedTypes: string[]
    }
  }
  stepsWithProgress: StepWithProgressDTO[]
}

export interface ProjectsResponse {
  data: ProjectCardDTO[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ErrorResponse {
  type: string
  title: string
  status: number
  detail: string
  errors?: Array<{
    path: string
    message: string
  }>
}