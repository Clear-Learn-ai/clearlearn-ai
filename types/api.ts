// API response types for educational platform
// Following BP-D1, BP-T6 patterns

import type { 
  SessionId, 
  MessageId, 
  VideoId,
  AiExplanation,
  VideoContent,
  EducationalError,
  LearningProgress
} from './education'

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: EducationalError
  timestamp: string
  requestId: string
}

// Chat API types
export interface ChatApiRequest {
  message: string
  sessionId: SessionId
  conversationHistory: ChatMessage[]
  userId?: string
  preferences?: StudentPreferences
}

export interface ChatApiResponse extends ApiResponse<{
  explanation: string
  videoResults: VideoContent[]
  sessionId: SessionId
  provider: 'claude' | 'openai' | 'openai-fallback'
  confidence: number
  followUpQuestions: string[]
}> {}

// Message structure for chat
export interface ChatMessage {
  id: MessageId
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  videoResults?: VideoContent[]
  aiExplanation?: string
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  processingTime?: number
  provider?: string
  confidence?: number
  conceptsCovered?: string[]
}

// Student preferences for personalized learning
export interface StudentPreferences {
  preferredModality: 'visual' | 'auditory' | 'reading' | 'kinesthetic'
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  priorKnowledge: string[]
}

// Video search API types
export interface VideoSearchApiRequest {
  query: string
  maxResults?: number
  filters?: VideoSearchFilters
  educationalLevel?: 'high-school' | 'undergraduate' | 'graduate'
}

export interface VideoSearchFilters {
  source?: ('youtube' | 'khan-academy' | 'coursera')[]
  duration?: 'short' | 'medium' | 'long'
  hasTranscript?: boolean
  minimumRating?: number
}

export interface VideoSearchApiResponse extends ApiResponse<{
  videos: VideoContent[]
  totalResults: number
  searchQuery: string
  appliedFilters: VideoSearchFilters
}> {}

// Session management API types
export interface SessionApiResponse extends ApiResponse<{
  sessionId: SessionId
  messageCount: number
  duration: number
  conceptsExplored: string[]
  learningProgress: LearningProgress
}> {}

// Error response structure
export interface ErrorApiResponse extends ApiResponse<never> {
  success: false
  error: EducationalError
  debugInfo?: {
    stack?: string
    requestDetails: Record<string, unknown>
    systemInfo: {
      timestamp: string
      endpoint: string
      method: string
    }
  }
}

// Rate limiting response
export interface RateLimitResponse extends ErrorApiResponse {
  error: EducationalError & {
    code: 'RATE_LIMIT_EXCEEDED'
    retryAfter: number
    remainingRequests: number
  }
}

// API status types for health checks
export interface ApiHealthResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceStatus[]
  uptime: number
  version: string
}> {}

export interface ServiceStatus {
  name: 'claude' | 'openai' | 'youtube' | 'database'
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  lastCheck: string
  errorCount: number
}

// Utility types for API handling
export type ApiEndpoint = '/api/chat' | '/api/videos/search' | '/api/session' | '/api/health'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestOptions {
  method: HttpMethod
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

// Type guards for API responses
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
  return response.success === true
}

export function isErrorResponse(response: ApiResponse<unknown>): response is ErrorApiResponse {
  return response.success === false && !!response.error
}

export function isRateLimitError(response: ApiResponse<unknown>): response is RateLimitResponse {
  return isErrorResponse(response) && (response as RateLimitResponse).error?.code === 'RATE_LIMIT_EXCEEDED'
}