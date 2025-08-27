// Educational domain types with branded IDs for type safety
// Following BP-C5: Use branded types for educational IDs

// Brand utility type
type Brand<T, B> = T & { __brand: B }

// Branded educational identifiers
export type SessionId = Brand<string, 'SessionId'>
export type MessageId = Brand<string, 'MessageId'>
export type VideoId = Brand<string, 'VideoId'>
export type UserId = Brand<string, 'UserId'>
export type QuestionId = Brand<string, 'QuestionId'>
export type ConceptId = Brand<string, 'ConceptId'>

// Educational domain enums
export enum LearningModality {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum SubjectArea {
  ORGANIC_CHEMISTRY = 'organic_chemistry',
  BIOCHEMISTRY = 'biochemistry',
  GENERAL_CHEMISTRY = 'general_chemistry',
  BIOLOGY = 'biology'
}

export enum ContentType {
  EXPLANATION = 'explanation',
  STEP_BY_STEP = 'step_by_step',
  VISUAL_DIAGRAM = 'visual_diagram',
  PRACTICE_PROBLEM = 'practice_problem',
  CONCEPT_MAP = 'concept_map'
}

// Core educational interfaces
export interface StudentQuery {
  id: QuestionId
  content: string
  subject: SubjectArea
  difficultyLevel?: DifficultyLevel
  learningModality?: LearningModality
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

export interface VideoContent {
  id: VideoId
  title: string
  description: string
  thumbnail: string
  url: string
  duration: string
  source: 'youtube' | 'khan-academy' | 'coursera' | 'edx'
  relevanceScore: number
  educationalValue: number
  transcript?: string
  chapters?: VideoChapter[]
}

export interface VideoChapter {
  title: string
  startTime: number
  endTime: number
  concepts: ConceptId[]
}

export interface LearningSession {
  id: SessionId
  userId?: UserId
  startTime: Date
  endTime?: Date
  studentQueries: StudentQuery[]
  conceptsExplored: ConceptId[]
  videosWatched: VideoId[]
  learningProgress: LearningProgress
  sessionNotes?: string
}

export interface LearningProgress {
  conceptsMastered: ConceptId[]
  conceptsInProgress: ConceptId[]
  questionsAsked: number
  videosCompleted: number
  sessionDuration: number
  engagementScore: number
}

export interface ConceptDefinition {
  id: ConceptId
  name: string
  subject: SubjectArea
  difficulty: DifficultyLevel
  prerequisites: ConceptId[]
  relatedConcepts: ConceptId[]
  description: string
  keywords: string[]
}

// API response types for educational content
export interface GenerateExplanationRequest {
  studentQuery: StudentQuery
  conversationHistory: StudentQuery[]
  preferredModality?: LearningModality
}

export interface GenerateExplanationResponse {
  explanation: AiExplanation
  recommendedVideos: VideoContent[]
  relatedConcepts: ConceptDefinition[]
  sessionId: SessionId
  provider: 'claude' | 'openai'
  confidence: number
}

export interface SearchVideoContentRequest {
  query: string
  subject: SubjectArea
  maxResults?: number
  difficultyLevel?: DifficultyLevel
}

export interface SearchVideoContentResponse {
  videos: VideoContent[]
  totalResults: number
  searchQuery: string
  relevanceThreshold: number
}

// Error types for educational domain
export interface EducationalError {
  code: 'CONCEPT_NOT_FOUND' | 'AI_UNAVAILABLE' | 'VIDEO_SEARCH_FAILED' | 'INVALID_QUERY' | 'RATE_LIMIT_EXCEEDED'
  message: string
  context?: Record<string, unknown>
  recoveryActions?: string[]
}

// Utility types for type guards
export function createSessionId(): SessionId {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId
}

export function createMessageId(): MessageId {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MessageId
}

export function createVideoId(source: string, originalId: string): VideoId {
  return `${source}_${originalId}` as VideoId
}

export function createQuestionId(): QuestionId {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as QuestionId
}

export function createConceptId(subject: SubjectArea, conceptName: string): ConceptId {
  const sanitizedName = conceptName.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `${subject}_${sanitizedName}` as ConceptId
}

// Type guards for educational domain validation
export function isValidSessionId(id: string): id is SessionId {
  return id.startsWith('session_') && id.length > 10
}

export function isValidVideoId(id: string): id is VideoId {
  return id.includes('_') && id.length > 5
}

export function isValidEducationalQuery(query: StudentQuery): query is StudentQuery {
  return query.content.length > 0 && 
         Object.values(SubjectArea).includes(query.subject) &&
         query.timestamp instanceof Date
}