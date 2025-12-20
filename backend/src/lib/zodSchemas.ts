import { z } from 'zod'

// Enums
export const LevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export const GuidanceTypeSchema = z.enum(['FULLY_GUIDED', 'SEMI_GUIDED', 'UNGUIDED'])
export const SubmissionTypeSchema = z.enum(['LINK', 'FILE', 'TEXT'])

// Project JSON schema for import
export const ProjectJsonSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  shortDesc: z.string().min(10),
  longDesc: z.string().min(10),
  classRange: z.object({ 
    min: z.number().int().min(1), 
    max: z.number().int().max(12) 
  }),
  level: LevelSchema,
  guidance: GuidanceTypeSchema,
  subjects: z.array(z.string()).nonempty(),
  tags: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  durationHrs: z.number().int().optional(),
  steps: z.array(z.object({
    order: z.number().int().min(1),
    title: z.string(),
    description: z.string(),
    checklist: z.array(z.object({ 
      order: z.number().int(), 
      text: z.string() 
    })).default([]),
    resources: z.array(z.object({ 
      title: z.string(), 
      url: z.string().url(), 
      type: z.string() 
    })).default([])
  })).nonempty(),
  submission: z.object({
    type: SubmissionTypeSchema,
    instruction: z.string(),
    allowedTypes: z.array(z.string()).default([])
  }).optional()
})

// API request schemas
export const EnrollmentCreateSchema = z.object({
  projectSlug: z.string(),
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  school: z.string().min(2, 'School name must be at least 2 characters'),
  classNum: z.number().int().min(1).max(12)
})

export const ChecklistUpdateSchema = z.object({
  checklistId: z.string(),
  completed: z.boolean()
})

export const StepUpdateSchema = z.object({
  stepId: z.string(),
  completed: z.boolean()
})

export const SubmissionCreateSchema = z.object({
  urlOrText: z.string()
})

// Phone number schema
export const PhoneNumberSchema = z.string()
  .refine((val) => {
    return /^\+[1-9]\d{1,14}$/.test(val)
  }, 'Phone number must be in international format (e.g., +919876543210)')

// Group member schema
export const AddGroupMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phoneNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true
      return /^\+[1-9]\d{1,14}$/.test(val)
    }, 'Phone number must be in international format (e.g., +919876543210)')
    .or(z.literal('')),
  school: z.string().optional(),
  classNum: z.number().int().min(1).max(12).optional(),
})

// Query schemas
export const ProjectsQuerySchema = z.object({
  class: z.coerce.number().int().min(1).max(12).optional(),
  subject: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  level: LevelSchema.optional(),
  guidance: GuidanceTypeSchema.optional(),
  q: z.string().optional(), // search query
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

// Error schema
export const ErrorResponseSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  errors: z.array(z.object({
    path: z.string(),
    message: z.string()
  })).optional()
})

export type ProjectJson = z.infer<typeof ProjectJsonSchema>
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>
export type ChecklistUpdate = z.infer<typeof ChecklistUpdateSchema>
export type StepUpdate = z.infer<typeof StepUpdateSchema>
export type SubmissionCreate = z.infer<typeof SubmissionCreateSchema>
export type AddGroupMember = z.infer<typeof AddGroupMemberSchema>
export type ProjectsQuery = z.infer<typeof ProjectsQuerySchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>