'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProjectsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new project management page
    router.replace('/admin/projects/manage')
  }, [router])

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p>Redirecting to project management...</p>
      </div>
    </div>
  )
}