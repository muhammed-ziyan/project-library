'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Level, GuidanceType } from '@/lib/types'

interface FilterPanelProps {
  filters: {
    class?: number
    subject?: string
    tags?: string
    level?: Level
    guidance?: GuidanceType
    q?: string
  }
  onFiltersChange: (filters: any) => void
  availableSubjects: string[]
  availableTags: string[]
}

export function FilterPanel({ 
  filters, 
  onFiltersChange, 
  availableSubjects, 
  availableTags 
}: FilterPanelProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleClassChange = (value: number) => {
    onFiltersChange({ ...filters, class: value })
  }

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    
    setSelectedSubjects(newSubjects)
    onFiltersChange({ 
      ...filters, 
      subject: newSubjects.length > 0 ? newSubjects.join(',') : undefined 
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    onFiltersChange({ 
      ...filters, 
      tags: newTags.length > 0 ? newTags.join(',') : undefined 
    })
  }

  const handleLevelChange = (level: Level | undefined) => {
    onFiltersChange({ ...filters, level })
  }

  const handleGuidanceChange = (guidance: GuidanceType | undefined) => {
    onFiltersChange({ ...filters, guidance })
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, q: value || undefined })
  }

  const resetFilters = () => {
    setSelectedSubjects([])
    setSelectedTags([])
    onFiltersChange({
      class: undefined,
      subject: undefined,
      tags: undefined,
      level: undefined,
      guidance: undefined,
      q: undefined
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Search projects..."
            value={filters.q || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Class Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Class</label>
          <div className="space-y-2">
            {[6, 7, 8, 9, 10, 11, 12].map((classNum) => (
              <Button
                key={classNum}
                variant={filters.class === classNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleClassChange(classNum)}
                className="w-full justify-start"
              >
                Class {classNum}
              </Button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="text-sm font-medium mb-2 block">Level</label>
          <div className="space-y-2">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as Level[]).map((level) => (
              <Button
                key={level}
                variant={filters.level === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLevelChange(filters.level === level ? undefined : level)}
                className="w-full justify-start"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Guidance */}
        <div>
          <label className="text-sm font-medium mb-2 block">Guidance</label>
          <div className="space-y-2">
            {(['FULLY_GUIDED', 'SEMI_GUIDED', 'UNGUIDED'] as GuidanceType[]).map((guidance) => (
              <Button
                key={guidance}
                variant={filters.guidance === guidance ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGuidanceChange(filters.guidance === guidance ? undefined : guidance)}
                className="w-full justify-start"
              >
                {guidance.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Subjects */}
        {availableSubjects.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Subjects</label>
            <div className="flex flex-wrap gap-1">
              {availableSubjects.slice(0, 10).map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubjects.includes(subject) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSubjectToggle(subject)}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {availableTags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1">
              {availableTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
