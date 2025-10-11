'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '@/lib/api'
import { ProjectCard } from '@/components/project-card'
import { FilterPanel } from '@/components/filter-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Level, GuidanceType, ProjectCardDTO } from '@/lib/types'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface BrowseFilters {
  class?: number
  subject?: string
  tags?: string
  level?: Level
  guidance?: GuidanceType
  q?: string
  page?: number
  pageSize?: number
}

export default function BrowsePage() {
  const [filters, setFilters] = useState<BrowseFilters>({
    page: 1,
    pageSize: 12
  })
  
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Fetch projects with current filters
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsAPI.list(filters),
    keepPreviousData: true,
  })

  // Extract unique subjects and tags from all projects for filter options
  useEffect(() => {
    if (projectsData?.data) {
      const subjects = new Set<string>()
      const tags = new Set<string>()
      
      projectsData.data.forEach(project => {
        project.subjects.forEach(subject => subjects.add(subject))
        project.tags.forEach(tag => tags.add(tag))
      })
      
      setAvailableSubjects(Array.from(subjects).sort())
      setAvailableTags(Array.from(tags).sort())
    }
  }, [projectsData])

  const handleFiltersChange = (newFilters: Partial<BrowseFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const totalPages = projectsData?.totalPages || 0
  const currentPage = filters.page || 1

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Error Loading Projects</h2>
              <p className="text-muted-foreground">
                There was an error loading the projects. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Projects</h1>
        <p className="text-muted-foreground">
          Discover AI/ML projects tailored to your learning level and interests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableSubjects={availableSubjects}
            availableTags={availableTags}
          />
        </div>

        {/* Projects Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : projectsData?.data.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more projects.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ page: 1, pageSize: 12 })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {projectsData?.total || 0} projects found
                    {projectsData?.totalPages && projectsData.totalPages > 1 && (
                      <span> • Page {currentPage} of {totalPages}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {projectsData?.data.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
