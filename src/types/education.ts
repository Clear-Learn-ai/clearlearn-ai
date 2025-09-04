// Educational domain types with branded IDs for type safety

type Brand<T, B> = T & { __brand: B }

export type SessionId = Brand<string, 'SessionId'>
export type MessageId = Brand<string, 'MessageId'>
export type VideoId = Brand<string, 'VideoId'>
export type UserId = Brand<string, 'UserId'>
export type QuestionId = Brand<string, 'QuestionId'>
export type ConceptId = Brand<string, 'ConceptId'>

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum SubjectArea {
  PLUMBING = 'plumbing'
}

export interface VideoChapter {
  title: string
  startTime: number
  endTime: number
  concepts: ConceptId[]
}

export interface VideoContent {
  id: VideoId
  title: string
  description: string
  thumbnail: string
  url: string
  duration: string
  source: 'youtube' | 'khan-academy' | 'coursera' | 'edx' | 'TradeAI Pro'
  relevanceScore: number
  educationalValue: number
  transcript?: string
  chapters?: VideoChapter[]
}

export interface LearningProgress {
  conceptsMastered: ConceptId[]
  conceptsInProgress: ConceptId[]
  questionsAsked: number
  videosCompleted: number
  sessionDuration: number
  engagementScore: number
}

export interface StudentQuery {
  id: QuestionId
  content: string
  subject: SubjectArea
  difficultyLevel?: DifficultyLevel
  timestamp: Date
  userId?: UserId
}

export interface AiExplanation {
  content: string
  conceptsCovered: ConceptId[]
  difficulty: DifficultyLevel
  followUpQuestions: string[]
  learningObjectives: string[]
  keyTerms: string[]
}

export interface GenerateExplanationRequest {
  studentQuery: StudentQuery
  conversationHistory: StudentQuery[]
}

export interface GenerateExplanationResponse {
  explanation: AiExplanation
  recommendedVideos: VideoContent[]
  relatedConcepts: { id: ConceptId; name: string }[]
  sessionId: SessionId
  provider: 'claude' | 'openai'
  confidence: number
}

export interface EducationalError {
  code: 'CONCEPT_NOT_FOUND' | 'AI_UNAVAILABLE' | 'VIDEO_SEARCH_FAILED' | 'INVALID_QUERY' | 'RATE_LIMIT_EXCEEDED'
  message: string
  context?: Record<string, unknown>
  recoveryActions?: string[]
}

export function createSessionId(): SessionId {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId
}

export function createMessageId(): MessageId {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MessageId
}

export function createVideoId(source: string, originalId: string): VideoId {
  return `${source}_${originalId}` as VideoId
}

