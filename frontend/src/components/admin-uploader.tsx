'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { projectsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Download,
  Loader2,
  XCircle,
  Info
} from 'lucide-react'

interface ProjectPreview {
  slug: string
  title: string
  shortDesc: string
  level: string
  guidance: string
  subjects: string[]
  tags: string[]
  steps: Array<{ title: string; description: string }>
  warnings?: string[]
}

interface UploadResult {
  success: boolean
  project?: any
  error?: string
  details?: any[]
  file?: string
  warnings?: string[]
}

interface BatchUploadResult {
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
}

interface AdminUploaderProps {
  token: string
}

export function AdminUploader({ token }: AdminUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [projectPreviews, setProjectPreviews] = useState<ProjectPreview[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [uploadMode, setUploadMode] = useState<'individual' | 'batch'>('individual')
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({})
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [batchResult, setBatchResult] = useState<BatchUploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Individual file upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 'uploading' }))
      
      try {
        const text = await file.text()
        const projectData = JSON.parse(text)
        
        // Validate required fields before sending
        const requiredFields = ['slug', 'title', 'shortDesc', 'longDesc', 'classRange', 'level', 'guidance', 'subjects', 'steps']
        const missingFields = requiredFields.filter(field => {
          if (field === 'classRange') {
            return !projectData[field] || !projectData[field].min || !projectData[field].max
          }
          return !projectData[field] || (Array.isArray(projectData[field]) && projectData[field].length === 0)
        })
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
        }
        
        const { normalized, warnings } = normalizeProjectData(projectData)
        const result = await projectsAPI.importJson(normalized, token)
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 'success' }))
        return { success: true, project: result.project, file: file.name, warnings }
      } catch (error: any) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 'error' }))
        
        // Try fallback to file upload method
        try {
          const result = await projectsAPI.import(file, token)
          setUploadProgress(prev => ({ ...prev, [file.name]: 'success' }))
          return { success: true, project: result.project, file: file.name }
        } catch (fallbackError: any) {
          throw {
            success: false,
            error: error.message || 'Upload failed',
            details: error.errors || [],
            file: file.name
          }
        }
      }
    },
    onSuccess: (result) => {
      setUploadResults(prev => [...prev, result])
    },
    onError: (error: any) => {
      const normalized: UploadResult =
        error && typeof error === 'object' && 'success' in error
          ? (error as UploadResult)
          : { success: false, error: (error?.message ?? 'Upload failed') }
      setUploadResults(prev => [...prev, normalized])
    }
  })

  // Batch upload mutation
  const batchUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await projectsAPI.importBatch(file, token)
    },
    onSuccess: (result) => {
      setBatchResult(result)
    }
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setValidationErrors([])
    setIsValidating(true)
    setUploadResults([])
    setBatchResult(null)
    
    const newFiles = [...uploadedFiles, ...acceptedFiles]
    setUploadedFiles(newFiles)

    const previews: ProjectPreview[] = []
    const errors: string[] = []

    for (const file of acceptedFiles) {
      try {
        const text = await file.text()
        const projectData = JSON.parse(text)
        
        const { normalized, warnings } = normalizeProjectData(projectData)

        previews.push({
          slug: normalized.slug,
          title: normalized.title,
          shortDesc: normalized.shortDesc,
          level: normalized.level,
          guidance: normalized.guidance,
          subjects: normalized.subjects,
          tags: normalized.tags,
          steps: normalized.steps,
          warnings,
        })
      } catch (error) {
        errors.push(`${file.name}: Invalid JSON format - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    setProjectPreviews([...projectPreviews, ...previews])
    setValidationErrors(errors)
    setIsValidating(false)
  }, [uploadedFiles, projectPreviews])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: true,
    maxSize: uploadMode === 'batch' ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for batch, 10MB for individual
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      )
      setValidationErrors(prev => [...prev, ...errors])
    }
  })

  const validateProjectData = (data: any, filename: string): string[] => {
    const errors: string[] = []
    
    if (!data.slug || typeof data.slug !== 'string' || data.slug.length < 3) {
      errors.push(`${filename}: Invalid or missing slug (minimum 3 characters)`)
    }
    
    if (!data.title || typeof data.title !== 'string' || data.title.length < 3) {
      errors.push(`${filename}: Invalid or missing title (minimum 3 characters)`)
    }
    
    if (!data.shortDesc || typeof data.shortDesc !== 'string' || data.shortDesc.length < 10) {
      errors.push(`${filename}: Invalid or missing shortDesc (minimum 10 characters)`)
    }
    
    if (!data.longDesc || typeof data.longDesc !== 'string' || data.longDesc.length < 10) {
      errors.push(`${filename}: Invalid or missing longDesc (minimum 10 characters)`)
    }
    
    if (!data.classRange || !data.classRange.min || !data.classRange.max) {
      errors.push(`${filename}: Missing or invalid classRange (must have min and max)`)
    }
    
    if (!data.subjects || !Array.isArray(data.subjects) || data.subjects.length === 0) {
      errors.push(`${filename}: Missing or invalid subjects (must be non-empty array)`)
    }
    
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      errors.push(`${filename}: Missing or invalid steps (must be non-empty array)`)
    }
    
    return errors
  }

  const normalizeProjectData = (data: any): { normalized: any; warnings: string[] } => {
    const warnings: string[] = []
    const normalized: any = { ...data }

    // slug
    if (!normalized.slug || typeof normalized.slug !== 'string' || normalized.slug.length < 3) {
      const base = (normalized.title && typeof normalized.title === 'string') ? normalized.title : 'Project'
      const slugBase = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      normalized.slug = (slugBase || 'project') + '-' + Math.random().toString(36).slice(2, 6)
      warnings.push('slug was missing/invalid and was autogenerated')
    }

    // title
    if (!normalized.title || typeof normalized.title !== 'string' || normalized.title.length < 3) {
      normalized.title = 'Untitled Project'
      warnings.push('title was missing/invalid and set to "Untitled Project"')
    }

    // shortDesc
    if (!normalized.shortDesc || typeof normalized.shortDesc !== 'string' || normalized.shortDesc.length < 10) {
      normalized.shortDesc = 'No short description provided.'
      warnings.push('shortDesc was missing/invalid and set to a placeholder')
    }

    // longDesc
    if (!normalized.longDesc || typeof normalized.longDesc !== 'string' || normalized.longDesc.length < 10) {
      normalized.longDesc = 'No long description provided yet.'
      warnings.push('longDesc was missing/invalid and set to a placeholder')
    }

    // classRange
    const min = Number(normalized?.classRange?.min)
    const max = Number(normalized?.classRange?.max)
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      normalized.classRange = { min: 1, max: 12 }
      warnings.push('classRange was missing/invalid and set to { min: 1, max: 12 }')
    } else {
      normalized.classRange = { min: Math.max(1, min), max: Math.min(12, max || 12) }
    }

    // enums
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
    const validGuidance = ['FULLY_GUIDED', 'SEMI_GUIDED', 'UNGUIDED']
    if (!validLevels.includes(normalized.level)) {
      normalized.level = 'BEGINNER'
      warnings.push('level was missing/invalid and set to BEGINNER')
    }
    if (!validGuidance.includes(normalized.guidance)) {
      normalized.guidance = 'FULLY_GUIDED'
      warnings.push('guidance was missing/invalid and set to FULLY_GUIDED')
    }

    // arrays
    if (!Array.isArray(normalized.subjects) || normalized.subjects.length === 0) {
      normalized.subjects = ['General']
      warnings.push('subjects were missing/invalid and set to ["General"]')
    }
    if (!Array.isArray(normalized.tags)) normalized.tags = []
    if (!Array.isArray(normalized.tools)) normalized.tools = []
    if (!Array.isArray(normalized.prerequisites)) normalized.prerequisites = []

    // steps
    if (!Array.isArray(normalized.steps) || normalized.steps.length === 0) {
      normalized.steps = [
        {
          order: 1,
          title: 'Step 1',
          description: 'TBD',
          checklist: [],
          resources: [],
        },
      ]
      warnings.push('steps were missing/invalid and a default step was added')
    } else {
      normalized.steps = normalized.steps.map((s: any, idx: number) => ({
        order: Number.isInteger(s?.order) ? s.order : idx + 1,
        title: typeof s?.title === 'string' && s.title ? s.title : `Step ${idx + 1}`,
        description: typeof s?.description === 'string' && s.description ? s.description : 'TBD',
        checklist: Array.isArray(s?.checklist) ? s.checklist : [],
        resources: Array.isArray(s?.resources) ? s.resources : [],
      }))
    }

    return { normalized, warnings }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviews = projectPreviews.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    setProjectPreviews(newPreviews)
    
    // Remove from progress tracking
    const fileName = uploadedFiles[index].name
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  const uploadAll = async () => {
    if (uploadMode === 'batch' && uploadedFiles.length === 1) {
      // Use batch upload for single file
      await batchUploadMutation.mutateAsync(uploadedFiles[0])
    } else {
      // Upload files individually
      for (let i = 0; i < uploadedFiles.length; i++) {
        try {
          await uploadMutation.mutateAsync(uploadedFiles[i])
        } catch (error) {
          console.error(`Failed to upload ${uploadedFiles[i].name}:`, error)
        }
      }
    }
  }

  const retryFailed = async () => {
    const failedFiles = uploadedFiles.filter((_, index) => 
      uploadResults[index] && !uploadResults[index].success
    )
    
    for (const file of failedFiles) {
      try {
        await uploadMutation.mutateAsync(file)
      } catch (error) {
        console.error(`Retry failed for ${file.name}:`, error)
      }
    }
  }

  const clearAll = () => {
    setUploadedFiles([])
    setProjectPreviews([])
    setValidationErrors([])
    setUploadResults([])
    setBatchResult(null)
    setUploadProgress({})
  }

  const downloadErrorReport = () => {
    if (!batchResult) return
    
    const report = {
      summary: batchResult.summary,
      successful: batchResult.results.successful,
      failed: batchResult.results.failed.map(f => ({
        index: f.index,
        error: f.error,
        details: f.details,
        projectTitle: f.data?.title || 'Unknown'
      }))
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upload-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getUploadStatus = (fileName: string) => {
    return uploadProgress[fileName] || 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Mode</CardTitle>
          <CardDescription>
            Choose how to upload your project files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={uploadMode === 'individual' ? 'default' : 'outline'}
              onClick={() => setUploadMode('individual')}
            >
              Individual Files
            </Button>
            <Button
              variant={uploadMode === 'batch' ? 'default' : 'outline'}
              onClick={() => setUploadMode('batch')}
            >
              Batch Upload
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                {uploadMode === 'individual' ? (
                  <p>Upload multiple JSON files individually. Each file should contain a single project definition.</p>
                ) : (
                  <p>Upload a single JSON file containing an array of project objects for batch processing.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Project JSON Files</CardTitle>
          <CardDescription>
            {uploadMode === 'individual' 
              ? 'Drag and drop JSON files or click to select. Each file should contain a complete project definition.'
              : 'Upload a single JSON file containing an array of project objects for batch processing.'
            }
            <br />
            <span className="text-xs text-muted-foreground">
              Need a template? <a href="/project-template.json" target="_blank" className="text-blue-600 hover:underline">Download project template</a>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : `Drag & drop ${uploadMode === 'batch' ? 'JSON file' : 'JSON files'} here`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to select {uploadMode === 'batch' ? 'file' : 'files'}
            </p>
            <Button variant="outline">
              Select {uploadMode === 'batch' ? 'File' : 'Files'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: {uploadMode === 'batch' ? '50MB' : '10MB'} per file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Previews</CardTitle>
                <CardDescription>
                  {uploadedFiles.length} file(s) ready for upload
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
                <Button 
                  onClick={uploadAll}
                  disabled={uploadMutation.isPending || batchUploadMutation.isPending || isValidating}
                >
                  {(uploadMutation.isPending || batchUploadMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload All'
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => {
                const preview = projectPreviews[index]
                const uploadStatus = getUploadStatus(file.name)
                const result = uploadResults.find(r => r.file === file.name)
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${
                    uploadStatus === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                    uploadStatus === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                    uploadStatus === 'uploading' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' :
                    'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(uploadStatus)}
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(file.size / 1024)} KB
                        </Badge>
                        {uploadStatus === 'error' && result && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                        {uploadStatus === 'success' && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Success
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploadStatus === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {preview && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{preview.title}</h4>
                          <p className="text-sm text-muted-foreground">{preview.shortDesc}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{preview.level}</Badge>
                          <Badge variant="outline">{preview.guidance.replace('_', ' ')}</Badge>
                          {preview.subjects.slice(0, 2).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {preview.subjects.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{preview.subjects.length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Slug: <code className="bg-muted px-1 rounded">{preview.slug}</code></p>
                          <p>Steps: {preview.steps.length}</p>
                          <p>Tags: {preview.tags.length}</p>
                        </div>
                      </div>
                    )}

                    {result && !result.success && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Error: {result.error}</p>
                        {result.details && result.details.length > 0 && (
                          <ul className="mt-2 text-xs text-red-600">
                            {result.details.map((detail, idx) => (
                              <li key={idx}>• {detail.path}: {detail.message}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {result && result.success && result.warnings && result.warnings.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                        <p className="text-sm text-amber-700 font-medium">Imported with warnings:</p>
                        <ul className="mt-2 text-xs text-amber-700">
                          {result.warnings.map((w, idx) => (
                            <li key={idx}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Upload Results */}
      {batchResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Batch Upload Results</CardTitle>
                <CardDescription>
                  {batchResult.summary.successful} successful, {batchResult.summary.failed} failed out of {batchResult.summary.total} total
                </CardDescription>
              </div>
              {batchResult.summary.failed > 0 && (
                <Button variant="outline" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batchResult.results.failed.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Failed Uploads:</h4>
                  <div className="space-y-2">
                    {batchResult.results.failed.map((failure, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-sm font-medium">Item {failure.index + 1}: {failure.data?.title || 'Unknown'}</p>
                        <p className="text-xs text-red-600 mt-1">Error: {failure.error}</p>
                        {failure.details && failure.details.length > 0 && (
                          <ul className="mt-1 text-xs text-red-600">
                            {failure.details.map((detail, idx) => (
                              <li key={idx}>• {detail.path}: {detail.message}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {batchResult.results.successful.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Successful Uploads:</h4>
                  <div className="space-y-1">
                    {batchResult.results.successful.map((success, index) => (
                      <div key={index} className="p-2 bg-green-50 dark:bg-green-950 rounded">
                        <p className="text-sm">Item {success.index + 1}: {success.project.title}</p>
                        <p className="text-xs text-green-600">Slug: {success.project.slug}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Status Summary */}
      {uploadResults.length > 0 && uploadMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {uploadResults.filter(r => r.success).length} successful
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    {uploadResults.filter(r => !r.success).length} failed
                  </span>
                </div>
              </div>
              {uploadResults.some(r => !r.success) && (
                <Button variant="outline" onClick={retryFailed}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}