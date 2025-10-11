'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCardDTO, Level, GuidanceType } from '@/lib/types'

interface ProjectCardProps {
  project: ProjectCardDTO
}

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const guidanceColors = {
  FULLY_GUIDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SEMI_GUIDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  UNGUIDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
            <div className="flex flex-col gap-1">
              <Badge className={levelColors[project.level]}>
                {project.level}
              </Badge>
              <Badge variant="outline" className={guidanceColors[project.guidance]}>
                {project.guidance.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {project.shortDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Classes {project.classMin}-{project.classMax}</span>
            </div>
            
            {project.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.subjects.slice(0, 2).map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {project.subjects.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.subjects.length - 2} more
                  </Badge>
                )}
              </div>
            )}
            
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
