// Type overrides for incorrect generated types
// Following BP-D2: Override incorrect generated types

// Database connection type override for transactions
export type DatabaseConnection = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>
  transaction: <T>(callback: (trx: DatabaseConnection) => Promise<T>) => Promise<T>
  close: () => Promise<void>
}

// Transaction type that mirrors DatabaseConnection interface
export type Transaction = DatabaseConnection

// YouTube API response overrides (their types are often incomplete)
export interface YouTubeSearchResult {
  kind: 'youtube#searchResult'
  etag: string
  id: {
    kind: 'youtube#video'
    videoId: string
  }
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      high?: { url: string; width: number; height: number }
    }
    channelTitle: string
    liveBroadcastContent: string
    publishTime: string
  }
}

export interface YouTubeApiResponse {
  kind: 'youtube#searchListResponse'
  etag: string
  nextPageToken?: string
  regionCode: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubeSearchResult[]
}

// OpenAI API type improvements
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
}

export interface OpenAICompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: OpenAIMessage
    finish_reason: 'stop' | 'length' | 'content_filter' | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Anthropic Claude API type improvements
export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string | Array<{
    type: 'text'
    text: string
  }>
}

export interface ClaudeResponse {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{
    type: 'text'
    text: string
  }>
  model: string
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence'
  stop_sequence?: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// Next.js API Route overrides for better typing
export interface NextApiRequest {
  query: Record<string, string | string[]>
  body: unknown
  cookies: Record<string, string>
  headers: Record<string, string>
  method?: string
  url?: string
}

export interface NextApiResponse<T = unknown> {
  status: (statusCode: number) => NextApiResponse<T>
  json: (body: T) => void
  end: (chunk?: string) => void
  setHeader: (name: string, value: string | string[]) => void
}

// Zustand store type improvements
export interface StoreApi<T> {
  setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void
  getState: () => T
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
  destroy: () => void
}

// React Hook Form overrides
export interface FieldError {
  type: string
  message?: string
  ref?: React.Ref<unknown>
}

export interface UseFormReturn<T> {
  register: (name: keyof T, options?: RegisterOptions) => {
    name: keyof T
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
    ref: React.Ref<HTMLInputElement>
  }
  handleSubmit: (onValid: (data: T) => void, onInvalid?: (errors: Record<keyof T, FieldError>) => void) => (event: React.FormEvent) => void
  formState: {
    errors: Record<keyof T, FieldError>
    isValid: boolean
    isSubmitting: boolean
    isDirty: boolean
  }
  reset: (values?: Partial<T>) => void
  setValue: (name: keyof T, value: T[keyof T]) => void
  watch: (name?: keyof T) => T[keyof T] | T
}

interface RegisterOptions {
  required?: boolean | string
  min?: number | string
  max?: number | string
  minLength?: number | string
  maxLength?: number | string
  pattern?: RegExp | string
  validate?: (value: unknown) => boolean | string
}

// Framer Motion overrides for better animation typing
export interface MotionProps {
  initial?: Record<string, unknown> | string | boolean
  animate?: Record<string, unknown> | string
  exit?: Record<string, unknown> | string
  transition?: {
    duration?: number
    delay?: number
    ease?: string | number[]
    type?: 'spring' | 'tween' | 'keyframes'
    stiffness?: number
    damping?: number
  }
  variants?: Record<string, Record<string, unknown>>
  whileHover?: Record<string, unknown>
  whileTap?: Record<string, unknown>
  drag?: boolean | 'x' | 'y'
  dragConstraints?: Record<string, number>
  onAnimationComplete?: () => void
}