import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format timestamp for chat messages
export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

// Format duration for videos
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Generate unique ID
export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Calculate relevance score for video results
export function calculateRelevance(query: string, videoTitle: string, videoDescription: string): number {
  const queryWords = query.toLowerCase().split(' ')
  const titleWords = videoTitle.toLowerCase().split(' ')
  const descriptionWords = videoDescription.toLowerCase().split(' ')
  
  let score = 0
  queryWords.forEach(word => {
    if (titleWords.includes(word)) score += 2
    if (descriptionWords.includes(word)) score += 1
  })
  
  return Math.min(score / queryWords.length, 1)
}