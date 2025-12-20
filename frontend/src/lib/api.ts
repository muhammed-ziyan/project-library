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
  
  const isFormData = options.body instanceof FormData
  const defaultHeaders: HeadersInit = isFormData
    ? { ...(options.headers as any) }
    : { 'Content-Type': 'application/json', ...(options.headers as any) }

  try {
    const response = await fetch(url, {
      headers: defaultHeaders,
      ...options,
    })

    const contentType = response.headers.get('content-type') || ''
    const rawText = await response.text()
    let data: any = undefined
    if (rawText && contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawText)
      } catch {
        // leave data undefined; we'll include rawText below
      }
    }

    if (!response.ok) {
      console.error('API Error Response:', {
        url,
        status: response.status,
        data,
        rawText
      })
      
      const error = (data || {}) as Partial<ErrorResponse>
      
      // For validation errors, provide more detailed information
      if (error.type?.includes('validation') && (error as any).errors) {
        const errs = (error as any).errors as Array<{ path: string; message: string }>
        const errorDetails = errs.map(err => `${err.path}: ${err.message}`).join(', ')
        throw new APIError(
          error.title || 'Validation Error',
          (error.status as number) || response.status,
          error.type || 'validation_error',
          `${error.detail || 'Validation failed'}. Details: ${errorDetails}`,
          errs
        )
      }
      
      throw new APIError(
        error.title || 'API Error',
        (error.status as number) || response.status,
        error.type || 'unknown',
        (error.detail as string) || (rawText || 'An error occurred'),
        (error as any).errors
      )
    }

    // Success path: require JSON body; if missing, throw clear error
    if (data === undefined) {
      throw new APIError(
        'Invalid JSON Response',
        response.status,
        'json_parse_error',
        'Expected JSON response but received empty or non-JSON body',
        undefined
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    console.error('Network or fetch error:', error)
    throw new APIError(
      'Network Error',
      0,
      'network_error',
      error instanceof Error ? error.message : 'Failed to connect to server',
      undefined
    )
  }
}

export const projectsAPI = {
  // Admin authentication
  adminLogin: (username: string, password: string): Promise<{ success: boolean; token: string; admin: any }> => {
    return fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  // Verify admin token against backend
  verifyAdmin: (token: string): Promise<{ ok: boolean }> => {
    return fetchAPI('/admin/verify', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Admin logout
  adminLogout: (token: string): Promise<{ success: boolean; message: string }> => {
    return fetchAPI('/admin/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Get admin stats
  getAdminStats: (token: string): Promise<{ totalProjects: number; totalEnrollments: number; totalSubmissions: number }> => {
    return fetchAPI('/admin/stats', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // List all projects for admin
  listAdminProjects: (token: string, params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<{
    projects: any[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    
    return fetchAPI(`/admin/projects?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Get single project for admin
  getAdminProject: (token: string, projectId: string): Promise<any> => {
    return fetchAPI(`/admin/projects/${projectId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Delete project
  deleteAdminProject: (token: string, projectId: string): Promise<{ success: boolean; message: string }> => {
    return fetchAPI(`/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Create project manually
  createAdminProject: (token: string, projectData: any): Promise<{ success: boolean; project: any }> => {
    return fetchAPI('/admin/projects', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData),
    })
  },

  // Update project
  updateAdminProject: (token: string, projectId: string, projectData: any): Promise<{ success: boolean; project: any }> => {
    return fetchAPI(`/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData),
    })
  },
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
  import: (file: File, token: string): Promise<{ success: boolean; project: any }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetchAPI('/projects/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
  },

  // Alternative import method - Direct JSON upload
  importJson: (projectData: any, token: string): Promise<{ success: boolean; project: any }> => {
    return fetchAPI('/projects/import-json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    })
  },

  // Batch import multiple projects
  importBatch: (file: File, token: string): Promise<{
    success: boolean
    results: {
      successful: Array<{ index: number; project: any }>
      failed: Array<{ index: number; error: string; details: any[]; data: any }>
      total: number
    }
    summary: {
      total: number
      successful: number
      failed: number
    }
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetchAPI('/projects/import-batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

  // Add group member to enrollment
  addGroupMember: (enrollmentId: string, memberData: {
    name: string
    email?: string
    phoneNumber?: string
    school?: string
    classNum?: number
  }): Promise<{ success: boolean; group: any }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/group-member`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    })
  },

  // Unassign from enrollment (leave project)
  unassign: (enrollmentId: string, token: string): Promise<{ success: boolean }> => {
    return fetchAPI(`/enrollments/${enrollmentId}/unassign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },
}

// User authentication API
export const userAuthAPI = {
  // Register new user
  register: (data: {
    enrollmentId: string
    phoneNumber: string
    password: string
    name?: string
    school?: string
    classNum?: number
  }): Promise<{ success: boolean; token: string; user: any }> => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Login user
  login: (phoneNumber: string, password: string): Promise<{ success: boolean; token: string; user: any }> => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password }),
    })
  },

  // Get current user profile
  me: (token: string): Promise<{ user: any; enrollments: any[] }> => {
    return fetchAPI('/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },
}

// Admin users API
export const adminUsersAPI = {
  // List users with pagination and filters
  listUsers: (token: string, params?: {
    page?: number
    pageSize?: number
    search?: string
    completionStatus?: 'all' | 'completed' | 'in_progress' | 'not_started'
  }): Promise<{ users: any[]; pagination: any }> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    return fetchAPI(`/admin/users?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Export users
  exportUsers: (token: string, params?: {
    search?: string
    completionStatus?: 'all' | 'completed' | 'in_progress' | 'not_started'
  }): Promise<{ users: any[] }> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    return fetchAPI(`/admin/users/export?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Get user detail
  getUserDetail: (token: string, userId: string): Promise<any> => {
    return fetchAPI(`/admin/users/${userId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },
}

// Analytics API
export const analyticsAPI = {
  // Get analytics overview
  getOverview: (token: string): Promise<{
    users: { total: number; active: number; completed: number; completionRate: number }
    engagement: { averageTimeSpent: number; totalSessions: number; averageSessionsPerUser: number }
    projects: { totalProjects: number; averageEnrollmentsPerProject: number }
    submissions: { total: number; averagePerUser: number }
  }> => {
    return fetchAPI('/admin/analytics/overview', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Get project performance
  getProjectPerformance: (token: string): Promise<{ projects: any[] }> => {
    return fetchAPI('/admin/analytics/projects', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },
}

// User messages API
export const userMessagesAPI = {
  // List user messages
  list: (token: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<{ messages: any[]; pagination: any }> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    return fetchAPI(`/me/messages?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Mark message as read
  markRead: (token: string, messageId: string): Promise<{ success: boolean }> => {
    return fetchAPI(`/me/messages/${messageId}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  // Get unread count
  getUnreadCount: (token: string): Promise<{ count: number }> => {
    return fetchAPI('/me/messages/unread-count', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },
}

export { APIError }