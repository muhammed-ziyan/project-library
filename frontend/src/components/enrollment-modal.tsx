'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { enrollmentsAPI } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const enrollmentSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  school: z.string().min(2, 'School name must be at least 2 characters'),
  classNum: z.number().min(1).max(12, 'Class must be between 1 and 12'),
})

type EnrollmentFormData = z.infer<typeof enrollmentSchema>

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  projectSlug: string
  projectTitle: string
}

export function EnrollmentModal({ 
  isOpen, 
  onClose, 
  projectSlug, 
  projectTitle 
}: EnrollmentModalProps) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  })

  const enrollmentMutation = useMutation({
    mutationFn: (data: EnrollmentFormData) =>
      enrollmentsAPI.create({
        projectSlug,
        email: data.email,
        name: data.name,
        school: data.school,
        classNum: data.classNum,
      }),
    onSuccess: (result) => {
      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/learn/${result.enrollmentId}`)
      }, 2000)
    },
  })

  const onSubmit = (data: EnrollmentFormData) => {
    enrollmentMutation.mutate(data)
  }

  const handleClose = () => {
    if (!enrollmentMutation.isPending) {
      reset()
      setIsSuccess(false)
      onClose()
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Enrollment Successful!</DialogTitle>
            <DialogDescription>
              You've been enrolled in "{projectTitle}". Redirecting to your learning journey...
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Setting up your project...</span>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in Project</DialogTitle>
          <DialogDescription>
            Join "{projectTitle}" and start your learning journey. Fill out the form below to get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Your full name"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="school" className="text-sm font-medium">
              School/Institution *
            </label>
            <Input
              id="school"
              {...register('school')}
              className={errors.school ? 'border-red-500' : ''}
              placeholder="Your school or institution"
              required
            />
            {errors.school && (
              <p className="text-sm text-red-500 mt-1">{errors.school.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="classNum" className="text-sm font-medium">
              Class/Grade *
            </label>
            <Input
              id="classNum"
              type="number"
              min="1"
              max="12"
              {...register('classNum', { valueAsNumber: true })}
              className={errors.classNum ? 'border-red-500' : ''}
              placeholder="Enter your class (1-12)"
            />
            {errors.classNum && (
              <p className="text-sm text-red-500 mt-1">{errors.classNum.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={enrollmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={enrollmentMutation.isPending}
            >
              {enrollmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          </DialogFooter>
        </form>

        {enrollmentMutation.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {enrollmentMutation.error.message || 'Failed to enroll. Please try again.'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
