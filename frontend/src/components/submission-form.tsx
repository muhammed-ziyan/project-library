'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { enrollmentsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmissionType } from '@/lib/types'
import { Upload, Link as LinkIcon, FileText, CheckCircle, ExternalLink } from 'lucide-react'

const linkSubmissionSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

const textSubmissionSchema = z.object({
  text: z.string().min(10, 'Submission must be at least 10 characters'),
})

const fileSubmissionSchema = z.object({
  file: z.instanceof(File, 'Please select a file'),
})

type LinkSubmissionData = z.infer<typeof linkSubmissionSchema>
type TextSubmissionData = z.infer<typeof textSubmissionSchema>
type FileSubmissionData = z.infer<typeof fileSubmissionSchema>

interface SubmissionFormProps {
  enrollmentId: string
  submissionType: SubmissionType
  instruction: string
  allowedTypes: string[]
}

export function SubmissionForm({ 
  enrollmentId, 
  submissionType, 
  instruction, 
  allowedTypes 
}: SubmissionFormProps) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch existing submissions
  const { data: submissionsData } = useQuery({
    queryKey: ['submissions', enrollmentId],
    queryFn: () => enrollmentsAPI.listSubmissions(enrollmentId),
  })

  const linkForm = useForm<LinkSubmissionData>({
    resolver: zodResolver(linkSubmissionSchema),
  })

  const textForm = useForm<TextSubmissionData>({
    resolver: zodResolver(textSubmissionSchema),
  })

  const fileForm = useForm<FileSubmissionData>({
    resolver: zodResolver(fileSubmissionSchema),
  })

  const linkMutation = useMutation({
    mutationFn: (data: LinkSubmissionData) =>
      enrollmentsAPI.createSubmission(enrollmentId, { urlOrText: data.url }),
    onSuccess: () => {
      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/learn/${enrollmentId}`)
      }, 2000)
    },
  })

  const textMutation = useMutation({
    mutationFn: (data: TextSubmissionData) =>
      enrollmentsAPI.createSubmission(enrollmentId, { urlOrText: data.text }),
    onSuccess: () => {
      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/learn/${enrollmentId}`)
      }, 2000)
    },
  })

  const fileMutation = useMutation({
    mutationFn: (file: File) =>
      enrollmentsAPI.createFileSubmission(enrollmentId, file),
    onSuccess: () => {
      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/learn/${enrollmentId}`)
      }, 2000)
    },
  })

  const handleLinkSubmit = (data: LinkSubmissionData) => {
    linkMutation.mutate(data)
  }

  const handleTextSubmit = (data: TextSubmissionData) => {
    textMutation.mutate(data)
  }

  const handleFileSubmit = (data: FileSubmissionData) => {
    fileMutation.mutate(data.file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      fileForm.setValue('file', file)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip')) return '📦'
    if (type.includes('image')) return '🖼️'
    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Submission Successful!</h3>
            <p className="text-muted-foreground">
              Your submission has been received. Redirecting back to your project...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Submission Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {submissionType === 'LINK' && <LinkIcon className="h-5 w-5" />}
            {submissionType === 'TEXT' && <FileText className="h-5 w-5" />}
            {submissionType === 'FILE' && <Upload className="h-5 w-5" />}
            Submission Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{instruction}</p>
          {allowedTypes.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Allowed file types:</p>
              <div className="flex flex-wrap gap-1">
                {allowedTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    .{type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Work</CardTitle>
          <CardDescription>
            {submissionType === 'LINK' && 'Provide a link to your completed project'}
            {submissionType === 'TEXT' && 'Describe your completed project'}
            {submissionType === 'FILE' && 'Upload your project files'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionType === 'LINK' && (
            <form onSubmit={linkForm.handleSubmit(handleLinkSubmit)} className="space-y-4">
              <div>
                <label htmlFor="url" className="text-sm font-medium mb-2 block">
                  Project URL *
                </label>
                <Input
                  id="url"
                  type="url"
                  {...linkForm.register('url')}
                  className={linkForm.formState.errors.url ? 'border-red-500' : ''}
                  placeholder="https://your-project-url.com"
                />
                {linkForm.formState.errors.url && (
                  <p className="text-sm text-red-500 mt-1">
                    {linkForm.formState.errors.url.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={linkMutation.isPending}
                className="w-full"
              >
                {linkMutation.isPending ? 'Submitting...' : 'Submit Link'}
              </Button>
            </form>
          )}

          {submissionType === 'TEXT' && (
            <form onSubmit={textForm.handleSubmit(handleTextSubmit)} className="space-y-4">
              <div>
                <label htmlFor="text" className="text-sm font-medium mb-2 block">
                  Project Description *
                </label>
                <Textarea
                  id="text"
                  {...textForm.register('text')}
                  className={textForm.formState.errors.text ? 'border-red-500' : ''}
                  placeholder="Describe your completed project, what you learned, and any outcomes..."
                  rows={6}
                />
                {textForm.formState.errors.text && (
                  <p className="text-sm text-red-500 mt-1">
                    {textForm.formState.errors.text.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={textMutation.isPending}
                className="w-full"
              >
                {textMutation.isPending ? 'Submitting...' : 'Submit Description'}
              </Button>
            </form>
          )}

          {submissionType === 'FILE' && (
            <form onSubmit={fileForm.handleSubmit(handleFileSubmit)} className="space-y-4">
              <div>
                <label htmlFor="file" className="text-sm font-medium mb-2 block">
                  Project Files *
                </label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept={allowedTypes.map(type => `.${type}`).join(',')}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {selectedFile ? 'Click to change file' : 'Click to upload files'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allowedTypes.length > 0 
                        ? `Allowed: ${allowedTypes.map(type => `.${type}`).join(', ')}`
                        : 'Any file type allowed'
                      }
                    </p>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileIcon(selectedFile.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {fileForm.formState.errors.file && (
                  <p className="text-sm text-red-500 mt-1">
                    {fileForm.formState.errors.file.message}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={fileMutation.isPending || !selectedFile}
                className="w-full"
              >
                {fileMutation.isPending ? 'Uploading...' : 'Upload Files'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      {submissionsData?.submissions && submissionsData.submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Submissions</CardTitle>
            <CardDescription>
              Your previous submissions for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissionsData.submissions.map((submission) => (
                <div key={submission.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {submission.urlOrText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {submission.urlOrText.startsWith('http') && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.urlOrText} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
