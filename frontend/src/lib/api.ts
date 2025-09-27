'use client'

import { ProjectsResponse, ProjectDetailDTO, EnrollmentDTO, EnrollmentDetailDTO, ErrorResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public type: string,
    public detail: string,
    public errors?: Array<{ path: string; message: string }>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = data as ErrorResponse
    throw new APIError(
      error.title || 'API Error',
      error.status || response.status,
      error.type || 'unknown',
      error.detail || 'An error occurred',
      error.errors
    )
  }

  return data
}

export const projectsAPI = {
  // List projects with filters
  list: (params?: {
    class?: number
    subject?: string
    tags?: string
    level?: string
    guidance?: string
    q?: string
    page?: number
    pageSize?: number
  }): Promise<ProjectsResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    
    return fetchAPI(`/projects?${searchParams.toString()}`)
  },

  // Get project by slug
  get: (slug: string): Promise<ProjectDetailDTO> => {
    return fetchAPI(`/projects/${slug}`)
  },

  // Import project (admin only)
  import: (file: File, adminKey: string): Promise<{ success: boolean; project: any }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetchAPI('/projects/import', {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey,
      },
      body: formData,
    })
  },
}

export const enrollmentsAPI = {
  // Create enrollment
  create: (data: {
    projectSlug: string
    email: string
    name?: string
    school?: string
    classNum: number
  }): Promise<{ enrollmentId: string; projectSlug: string }> => {
    return fetchAPI('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Get enrollment detail
  get: (enrollmentId: string): Promise<EnrollmentDetailDTO> => {
    return fetchAPI(`/enrollments/${enrollmentId}`)
  },

  // Update checklist item
  updateChecklist: (enrollmentId: string, data: {
    checklistId: string
    completed: boolean
  }): Promise<{ success: boolean }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Update step completion
  updateStep: (enrollmentId: string, data: {
    stepId: string
    completed: boolean
  }): Promise<{ success: boolean }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/step`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Create submission
  createSubmission: (enrollmentId: string, data: {
    urlOrText: string
  }): Promise<{ submissionId: string; success: boolean }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Create file submission
  createFileSubmission: (enrollmentId: string, file: File): Promise<{ submissionId: string; success: boolean }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetchAPI(`/enrollments/${enrollmentId}/submissions`, {
      method: 'POST',
      body: formData,
    })
  },

  // List submissions
  listSubmissions: (enrollmentId: string): Promise<{
    submissions: Array<{
      id: string
      urlOrText: string
      createdAt: string
    }>
  }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/submissions`)
  },
}

export { APIError }