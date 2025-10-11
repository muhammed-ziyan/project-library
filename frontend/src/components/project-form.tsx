'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { projectsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

interface ProjectFormData {
  id?: string
  slug: string
  title: string
  shortDesc: string
  longDesc: string
  classRange: { min: number; max: number }
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  guidance: 'FULLY_GUIDED' | 'SEMI_GUIDED' | 'UNGUIDED'
  subjects: string[]
  tags: string[]
  tools: string[]
  prerequisites: string[]
  durationHrs?: number
  steps: Array<{
    order: number
    title: string
    description: string
    checklist: Array<{ order: number; text: string }>
    resources: Array<{ title: string; url: string; type: string }>
  }>
  submission?: {
    type: 'LINK' | 'FILE' | 'TEXT'
    instruction: string
    allowedTypes: string[]
  }
}

interface ProjectFormProps {
  token: string
  initialData?: Partial<ProjectFormData>
  onSuccess?: (project: any) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export function ProjectForm({ token, initialData, onSuccess, onCancel, mode = 'create' }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    id: initialData?.id,
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    shortDesc: initialData?.shortDesc || '',
    longDesc: initialData?.longDesc || '',
    classRange: initialData?.classRange || { min: 1, max: 12 },
    level: initialData?.level || 'BEGINNER',
    guidance: initialData?.guidance || 'FULLY_GUIDED',
    subjects: initialData?.subjects || [],
    tags: initialData?.tags || [],
    tools: initialData?.tools || [],
    prerequisites: initialData?.prerequisites || [],
    durationHrs: initialData?.durationHrs,
    steps: initialData?.steps || [
      {
        order: 1,
        title: '',
        description: '',
        checklist: [],
        resources: []
      }
    ],
    submission: initialData?.submission
  })

  const [newSubject, setNewSubject] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newTool, setNewTool] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }, [])

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }))
      setNewSubject('')
    }
  }

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()]
      }))
      setNewTool('')
    }
  }

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }))
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }))
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (prerequisite: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prerequisite)
    }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          order: prev.steps.length + 1,
          title: '',
          description: '',
          checklist: [],
          resources: []
        }
      ]
    }))
  }

  const updateStep = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        order: i + 1
      }))
    }))
  }

  const addChecklistItem = (stepIndex: number) => {
    const step = formData.steps[stepIndex]
    const newItem = {
      order: step.checklist.length + 1,
      text: ''
    }
    updateStep(stepIndex, 'checklist', [...step.checklist, newItem])
  }

  const updateChecklistItem = (stepIndex: number, itemIndex: number, text: string) => {
    const step = formData.steps[stepIndex]
    const updatedChecklist = step.checklist.map((item, i) => 
      i === itemIndex ? { ...item, text } : item
    )
    updateStep(stepIndex, 'checklist', updatedChecklist)
  }

  const removeChecklistItem = (stepIndex: number, itemIndex: number) => {
    const step = formData.steps[stepIndex]
    const updatedChecklist = step.checklist.filter((_, i) => i !== itemIndex)
      .map((item, i) => ({ ...item, order: i + 1 }))
    updateStep(stepIndex, 'checklist', updatedChecklist)
  }

  const addResource = (stepIndex: number) => {
    const step = formData.steps[stepIndex]
    const newResource = {
      title: '',
      url: '',
      type: 'link'
    }
    updateStep(stepIndex, 'resources', [...step.resources, newResource])
  }

  const updateResource = (stepIndex: number, resourceIndex: number, field: string, value: string) => {
    const step = formData.steps[stepIndex]
    const updatedResources = step.resources.map((resource, i) => 
      i === resourceIndex ? { ...resource, [field]: value } : resource
    )
    updateStep(stepIndex, 'resources', updatedResources)
  }

  const removeResource = (stepIndex: number, resourceIndex: number) => {
    const step = formData.steps[stepIndex]
    const updatedResources = step.resources.filter((_, i) => i !== resourceIndex)
    updateStep(stepIndex, 'resources', updatedResources)
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.slug.trim()) errors.push('Slug is required')
    if (!formData.title.trim()) errors.push('Title is required')
    if (!formData.shortDesc.trim()) errors.push('Short description is required')
    if (!formData.longDesc.trim()) errors.push('Long description is required')
    if (formData.subjects.length === 0) errors.push('At least one subject is required')
    if (formData.steps.length === 0) errors.push('At least one step is required')
    
    // Validate steps
    formData.steps.forEach((step, index) => {
      if (!step.title.trim()) errors.push(`Step ${index + 1}: Title is required`)
      if (!step.description.trim()) errors.push(`Step ${index + 1}: Description is required`)
    })

    return errors
  }

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData = {
        ...data,
        classRange: data.classRange
      }
      return await projectsAPI.createAdminProject(token, projectData)
    },
    onSuccess: (result) => {
      setErrors([])
      onSuccess?.(result.project)
    },
    onError: (error: any) => {
      setErrors([error.detail || error.message || 'Failed to create project'])
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData = {
        ...data,
        classRange: data.classRange
      }
      return await projectsAPI.updateAdminProject(token, initialData?.id || '', projectData)
    },
    onSuccess: (result) => {
      setErrors([])
      onSuccess?.(result.project)
    },
    onError: (error: any) => {
      setErrors([error.detail || error.message || 'Failed to update project'])
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Sanitize and validate data before sending
    const sanitizedData = {
      ...formData,
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      shortDesc: formData.shortDesc.trim(),
      longDesc: formData.longDesc.trim(),
      subjects: formData.subjects.filter(s => s.trim()),
      tags: formData.tags.filter(t => t.trim()),
      tools: formData.tools.filter(t => t.trim()),
      prerequisites: formData.prerequisites.filter(p => p.trim()),
      steps: formData.steps
        .filter(step => step.title.trim() && step.description.trim())
        .map((step, index) => ({
          ...step,
          order: step.order || index + 1,
          title: step.title.trim(),
          description: step.description.trim(),
          checklist: (step.checklist || [])
            .filter(item => item.text.trim())
            .map((item, itemIndex) => ({
              ...item,
              order: item.order || itemIndex + 1,
              text: item.text.trim()
            })),
          resources: (step.resources || [])
            .filter(resource => resource.title.trim() && resource.url.trim())
            .map(resource => ({
              ...resource,
              title: resource.title.trim(),
              url: resource.url.trim(),
              type: resource.type.trim() || 'link'
            }))
        })),
      classRange: {
        min: Math.max(1, Math.min(12, formData.classRange.min)),
        max: Math.max(1, Math.min(12, formData.classRange.max))
      },
      submission: formData.submission ? {
        ...formData.submission,
        instruction: formData.submission.instruction.trim(),
        allowedTypes: formData.submission.allowedTypes.filter(t => t.trim())
      } : undefined
    }

    // Final validation
    if (sanitizedData.subjects.length === 0) {
      setErrors(['At least one subject is required'])
      return
    }

    if (sanitizedData.steps.length === 0) {
      setErrors(['At least one step is required'])
      return
    }

    if (mode === 'edit') {
      updateMutation.mutate(sanitizedData)
    } else {
      createMutation.mutate(sanitizedData)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Fill in the details to create a new project for the library'
              : 'Update the project information'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="project-slug"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description *</label>
              <Textarea
                value={formData.shortDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                placeholder="Brief description of the project"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Long Description *</label>
              <Textarea
                value={formData.longDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, longDesc: e.target.value }))}
                placeholder="Detailed description of the project"
                rows={5}
                required
              />
            </div>

            {/* Class Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.classRange.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      classRange: { ...prev.classRange, min: parseInt(e.target.value) || 1 }
                    }))}
                  />
                  <span className="flex items-center">to</span>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.classRange.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      classRange: { ...prev.classRange, max: parseInt(e.target.value) || 12 }
                    }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <Select
                  value={formData.level}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Guidance</label>
                <Select
                  value={formData.guidance}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, guidance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULLY_GUIDED">Fully Guided</SelectItem>
                    <SelectItem value="SEMI_GUIDED">Semi Guided</SelectItem>
                    <SelectItem value="UNGUIDED">Unguided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium mb-2">Subjects *</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add subject"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                />
                <Button type="button" onClick={addSubject} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <label className="block text-sm font-medium mb-2">Tools</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  placeholder="Add tool"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                />
                <Button type="button" onClick={addTool} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="flex items-center gap-1">
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTool(tool)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium mb-2">Prerequisites</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" onClick={addPrerequisite} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites.map((prerequisite) => (
                  <Badge key={prerequisite} variant="outline" className="flex items-center gap-1">
                    {prerequisite}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(prerequisite)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration (hours)</label>
              <Input
                type="number"
                min="1"
                value={formData.durationHrs || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  durationHrs: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="Estimated duration in hours"
              />
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Project Steps *</label>
                <Button type="button" onClick={addStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Step {step.order}</h4>
                      {formData.steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="Step title"
                        required
                      />
                      <Textarea
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="Step description"
                        rows={3}
                        required
                      />
                      
                      {/* Checklist */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Checklist</label>
                        <div className="space-y-2">
                          {step.checklist.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-2">
                              <Input
                                value={item.text}
                                onChange={(e) => updateChecklistItem(index, itemIndex, e.target.value)}
                                placeholder="Checklist item"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChecklistItem(index, itemIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChecklistItem(index)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Checklist Item
                          </Button>
                        </div>
                      </div>
                      
                      {/* Resources */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Resources</label>
                        <div className="space-y-2">
                          {step.resources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                value={resource.title}
                                onChange={(e) => updateResource(index, resourceIndex, 'title', e.target.value)}
                                placeholder="Resource title"
                              />
                              <Input
                                value={resource.url}
                                onChange={(e) => updateResource(index, resourceIndex, 'url', e.target.value)}
                                placeholder="URL"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={resource.type}
                                  onChange={(e) => updateResource(index, resourceIndex, 'type', e.target.value)}
                                  placeholder="Type"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeResource(index, resourceIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addResource(index)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submission */}
            <div>
              <label className="block text-sm font-medium mb-2">Submission Requirements</label>
              <div className="space-y-3">
                <Select
                  value={formData.submission?.type || ''}
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    submission: { ...prev.submission!, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select submission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINK">Link</SelectItem>
                    <SelectItem value="FILE">File</SelectItem>
                    <SelectItem value="TEXT">Text</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.submission?.type && (
                  <>
                    <Textarea
                      value={formData.submission.instruction || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        submission: { ...prev.submission!, instruction: e.target.value }
                      }))}
                      placeholder="Submission instructions"
                      rows={3}
                    />
                    <Input
                      value={formData.submission.allowedTypes?.join(', ') || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        submission: { 
                          ...prev.submission!, 
                          allowedTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      }))}
                      placeholder="Allowed file types (comma-separated)"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700">Please fix the following errors:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Project' : 'Update Project'}
                  </>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
