export interface AIServiceConfig {
  apiKey: string
  baseUrl?: string
  model?: string
  timeout?: number
}

export interface MediaGenerationRequest {
  prompt: string
  type: MediaType
  options?: MediaOptions
}

export interface MediaOptions {
  width?: number
  height?: number
  duration?: number
  quality?: 'draft' | 'standard' | 'high'
  format?: string
  style?: string
}

export type MediaType = 
  | 'text'
  | 'image' 
  | 'video'
  | 'audio'
  | '3d-model'
  | 'diagram'

export interface GeneratedMedia {
  id: string
  type: MediaType
  url?: string
  data?: string
  metadata: {
    provider: AIProvider
    model?: string
    generationTime: number
    tokens?: number
    cost?: number
  }
}

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'groq'
  | 'tripo'
  | 'meshy'
  | 'luma'
  | 'runway'
  | 'pika'
  | 'elevenlabs'
  | 'midjourney'
  | 'stable-diffusion'

export interface OrchestrationPlan {
  query: string
  mediaTypes: MediaType[]
  services: {
    [key in MediaType]?: AIProvider
  }
  parallel: boolean
  fallbacks: {
    [key in AIProvider]?: AIProvider[]
  }
}

export interface OrchestrationResult {
  query: string
  media: GeneratedMedia[]
  totalTime: number
  errors: Array<{
    provider: AIProvider
    error: string
  }>
  plan: OrchestrationPlan
}

export interface ProgressUpdate {
  stage: 'planning' | 'generating' | 'composing' | 'complete'
  provider?: AIProvider
  mediaType?: MediaType
  progress: number
  message: string
}