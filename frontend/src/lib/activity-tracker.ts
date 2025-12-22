'use client'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

interface TrackActivityParams {
  enrollmentId: string
  activityType: 'PAGE_VIEW' | 'SESSION_START' | 'SESSION_END'
  metadata?: any
}

let sessionStartTime: number | null = null
let currentEnrollmentId: string | null = null

/**
 * Track user activity on the backend
 */
async function trackActivity({ enrollmentId, activityType, metadata }: TrackActivityParams) {
  try {
    await fetch(`${BASE_URL}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        enrollmentId,
        activityType,
        metadata
      })
    })
  } catch (error) {
    console.error('Failed to track activity:', error)
  }
}

/**
 * Track page view
 */
export function trackPageView(enrollmentId: string, page: string) {
  trackActivity({
    enrollmentId,
    activityType: 'PAGE_VIEW',
    metadata: { page }
  })
}

/**
 * Start tracking a session
 */
export function startSession(enrollmentId: string) {
  if (!sessionStartTime || currentEnrollmentId !== enrollmentId) {
    sessionStartTime = Date.now()
    currentEnrollmentId = enrollmentId

    trackActivity({
      enrollmentId,
      activityType: 'SESSION_START',
      metadata: { startTime: new Date().toISOString() }
    })
  }
}

/**
 * End tracking a session
 */
export function endSession() {
  if (sessionStartTime && currentEnrollmentId) {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60) // in minutes

    trackActivity({
      enrollmentId: currentEnrollmentId,
      activityType: 'SESSION_END',
      metadata: {
        endTime: new Date().toISOString(),
        durationMinutes: sessionDuration
      }
    })

    sessionStartTime = null
    currentEnrollmentId = null
  }
}

/**
 * Initialize activity tracking for a page
 * Call this in useEffect on pages that need tracking
 */
export function initializeActivityTracking(enrollmentId: string, pageName: string) {
  // Start session
  startSession(enrollmentId)

  // Track page view
  trackPageView(enrollmentId, pageName)

  // Set up beforeunload event to end session
  const handleBeforeUnload = () => {
    endSession()
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    endSession()
  }
}

/**
 * React hook for activity tracking
 */
export function useActivityTracking(enrollmentId: string | null, pageName: string) {
  if (typeof window === 'undefined' || !enrollmentId) {
    return
  }

  // This should be used in a useEffect hook
  return initializeActivityTracking(enrollmentId, pageName)
}

