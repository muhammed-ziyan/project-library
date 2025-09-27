import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatClassRange(min: number, max: number): string {
  if (min === max) {
    return `Grade ${min}`
  }
  return `Grades ${min}-${max}`
}

export function formatDuration(hours?: number): string {
  if (!hours) return 'Duration varies'
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`
  } else if (hours === 1) {
    return '1 hour'
  } else if (hours < 24) {
    return `${hours} hours`
  } else {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`
    }
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h`
  }
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'INTERMEDIATE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'ADVANCED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function getGuidanceColor(guidance: string): string {
  switch (guidance) {
    case 'FULLY_GUIDED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'SEMI_GUIDED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'UNGUIDED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}