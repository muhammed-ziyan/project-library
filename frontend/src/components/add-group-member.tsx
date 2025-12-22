'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { PhoneInput } from '@/components/phone-input'
import { Loader2, UserPlus } from 'lucide-react'

const addMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phoneNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true
      return /^\+[1-9]\d{1,14}$/.test(val)
    }, 'Phone number must be in international format (e.g., +919876543210)')
    .or(z.literal('')),
  school: z.string().optional(),
  classNum: z.number().min(1).max(12, 'Class must be between 1 and 12').optional(),
})

type AddMemberFormData = z.infer<typeof addMemberSchema>

interface AddGroupMemberProps {
  isOpen: boolean
  onClose: () => void
  enrollmentId: string
}

export function AddGroupMember({ 
  isOpen, 
  onClose, 
  enrollmentId 
}: AddGroupMemberProps) {
  const queryClient = useQueryClient()
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: AddMemberFormData) => {
      const memberData: any = {
        name: data.name,
      }
      
      if (data.email && data.email.length > 0) {
        memberData.email = data.email
      }
      if (data.phoneNumber && data.phoneNumber.length > 0) {
        memberData.phoneNumber = data.phoneNumber
      }
      if (data.school) {
        memberData.school = data.school
      }
      if (data.classNum) {
        memberData.classNum = data.classNum
      }
      
      return enrollmentsAPI.addGroupMember(enrollmentId, memberData)
    },
    onSuccess: () => {
      setIsSuccess(true)
      
      // Invalidate enrollment query to refresh data
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] })
      
      setTimeout(() => {
        reset()
        setIsSuccess(false)
        onClose()
      }, 2000)
    },
  })

  const onSubmit = (data: AddMemberFormData) => {
    addMemberMutation.mutate(data)
  }

  const handleClose = () => {
    if (!addMemberMutation.isPending && !isSuccess) {
      reset()
      onClose()
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Member Added!</DialogTitle>
            <DialogDescription>
              Your team member has been successfully added to the group.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-green-600">
              <UserPlus className="h-6 w-6" />
              <span className="font-medium">Second member added successfully</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a second member to your group. Both members will share the same progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Team member's full name"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="member@example.com (optional)"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <PhoneInput
              id="phoneNumber"
              value={watch('phoneNumber') || ''}
              onChange={(value) => setValue('phoneNumber', value, { shouldValidate: true })}
              onBlur={() => trigger('phoneNumber')}
              error={errors.phoneNumber?.message}
          
            />
          </div>

          <div>
            <label htmlFor="school" className="text-sm font-medium">
              School/Institution
            </label>
            <Input
              id="school"
              {...register('school')}
              placeholder="School name (optional)"
            />
          </div>

          <div>
            <label htmlFor="classNum" className="text-sm font-medium">
              Class/Grade
            </label>
            <Input
              id="classNum"
              type="number"
              min="1"
              max="12"
              {...register('classNum', { valueAsNumber: true })}
              placeholder="1-12 (optional)"
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
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {addMemberMutation.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              Failed to Add Member
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {addMemberMutation.error.message || 'Failed to add team member. Please try again.'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

