'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { projectsAPI } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnrollmentModal } from '@/components/enrollment-modal'
import { ProjectDetailDTO, Level, GuidanceType } from '@/lib/types'
import { Clock, Users, BookOpen, CheckCircle, ExternalLink } from 'lucide-react'

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

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsAPI.get(slug),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/browse">Browse Projects</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{project.shortDesc}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={levelColors[project.level]}>
              {project.level}
            </Badge>
            <Badge variant="outline" className={guidanceColors[project.guidance]}>
              {project.guidance.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Classes {project.classMin}-{project.classMax}</span>
          </div>
          {project.durationHrs && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{project.durationHrs} hours</span>
            </div>
          )}
        </div>

        <Button 
          size="lg" 
          onClick={() => setIsEnrollmentModalOpen(true)}
          className="mb-8"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          I'm Interested - Enroll Now
        </Button>
      </div>

      {/* Project Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="submission">Submission</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{project.longDesc}</p>
            </CardContent>
          </Card>

          {project.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
                <CardDescription>
                  What you should know before starting this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {project.subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.tools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <Badge key={tool} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Steps</CardTitle>
              <CardDescription>
                Follow these steps to complete your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {project.steps.map((step, index) => (
                  <div key={step.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {step.order}
                      </span>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground ml-8">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission" className="space-y-6">
          {project.submission ? (
            <Card>
              <CardHeader>
                <CardTitle>Submission Requirements</CardTitle>
                <CardDescription>
                  How to submit your completed project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Submission Type: {project.submission.type}</h4>
                  <p className="text-muted-foreground">{project.submission.instruction}</p>
                  {Array.isArray(project.submission.allowedTypes) && project.submission.allowedTypes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Allowed file types:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.submission.allowedTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            .{type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Submission Required</h3>
                  <p className="text-muted-foreground">
                    This project doesn't require a formal submission.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        projectSlug={project.slug}
        projectTitle={project.title}
      />
    </div>
  )
}
