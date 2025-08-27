import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Educational domain imports - Following BP-C6: Use import type for type-only imports
import type {
  SessionId,
  MessageId,
  VideoId,
  StudentQuery,
  VideoContent,
  LearningSession,
  LearningProgress,
  EducationalError
} from '../types/education'
import { SubjectArea } from '../types/education'
import type { ChatMessage, ChatApiRequest } from '../types/api'
import { createSessionId, createMessageId } from '../types/education'

// Updated interfaces using educational domain types
export interface StudentLearningSession {
  id: SessionId
  startTime: Date
  messages: ChatMessage[]
  currentQuery: string
  isGeneratingExplanation: boolean
  educationalError: EducationalError | null
  recommendedVideos: VideoContent[]
  selectedVideo: VideoContent | null
  learningProgress: LearningProgress
}

// Educational tutor store interface with domain vocabulary
interface EducationalTutorStore {
  // Learning session state
  learningSession: StudentLearningSession
  
  // Educational actions - Following BP-C2: Educational domain vocabulary
  submitStudentQuery: (content: string) => Promise<void>
  updateCurrentQuery: (query: string) => void
  selectEducationalVideo: (video: VideoContent) => void
  clearLearningSession: () => void
  setEducationalError: (error: EducationalError | null) => void
  
  // Educational analytics and progress
  getRecentQueries: () => ChatMessage[]
  getLearningSessionStats: () => { queryCount: number; sessionDuration: number; conceptsExplored: number }
  updateLearningProgress: (progress: Partial<LearningProgress>) => void
}

export const useEducationalTutorStore = create<EducationalTutorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial learning session state
    learningSession: {
      id: createSessionId(),
      startTime: new Date(),
      messages: [],
      currentQuery: '',
      isGeneratingExplanation: false,
      educationalError: null,
      recommendedVideos: [],
      selectedVideo: null,
      learningProgress: {
        conceptsMastered: [],
        conceptsInProgress: [],
        questionsAsked: 0,
        videosCompleted: 0,
        sessionDuration: 0,
        engagementScore: 0.5
      }
    },
    
    // Educational actions using domain vocabulary
    submitStudentQuery: async (content: string) => {
      const { learningSession } = get()
      
      // Create user message
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content,
        timestamp: new Date()
      }
      
      set(state => ({
        learningSession: {
          ...state.learningSession,
          messages: [...state.learningSession.messages, userMessage],
          isGeneratingExplanation: true,
          educationalError: null,
          currentQuery: content,
          learningProgress: {
            ...state.learningSession.learningProgress,
            questionsAsked: state.learningSession.learningProgress.questionsAsked + 1
          }
        }
      }))
      
      try {
        // Call educational AI API with proper typing
        const apiRequest: ChatApiRequest = {
          message: content,
          sessionId: learningSession.id,
          conversationHistory: learningSession.messages
        }
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiRequest)
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate educational explanation')
        }
        
        const data = await response.json()
        
        // Create assistant response message
        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: data.explanation,
          timestamp: new Date(),
          videoResults: data.videoResults || []
        }
        
        set(state => ({
          learningSession: {
            ...state.learningSession,
            messages: [...state.learningSession.messages, assistantMessage],
            isGeneratingExplanation: false,
            recommendedVideos: data.videoResults || [],
            learningProgress: {
              ...state.learningSession.learningProgress,
              engagementScore: Math.min(state.learningSession.learningProgress.engagementScore + 0.1, 1.0)
            }
          }
        }))
        
      } catch (error) {
        console.error('Error generating educational explanation:', error)
        const educationalError: EducationalError = {
          code: 'AI_UNAVAILABLE',
          message: error instanceof Error ? error.message : 'Failed to generate explanation',
          context: { query: content, sessionId: learningSession.id },
          recoveryActions: ['Try rephrasing your question', 'Check your internet connection', 'Try again in a moment']
        }
        
        set(state => ({
          learningSession: {
            ...state.learningSession,
            isGeneratingExplanation: false,
            educationalError
          }
        }))
      }
    },
    
    updateCurrentQuery: (query: string) => {
      set(state => ({
        learningSession: {
          ...state.learningSession,
          currentQuery: query,
          educationalError: null
        }
      }))
    },
    
    selectEducationalVideo: (video: VideoContent) => {
      set(state => ({
        learningSession: {
          ...state.learningSession,
          selectedVideo: video,
          learningProgress: {
            ...state.learningSession.learningProgress,
            videosCompleted: state.learningSession.learningProgress.videosCompleted + 1
          }
        }
      }))
    },
    
    clearLearningSession: () => {
      set({
        learningSession: {
          id: createSessionId(),
          startTime: new Date(),
          messages: [],
          currentQuery: '',
          isGeneratingExplanation: false,
          educationalError: null,
          recommendedVideos: [],
          selectedVideo: null,
          learningProgress: {
            conceptsMastered: [],
            conceptsInProgress: [],
            questionsAsked: 0,
            videosCompleted: 0,
            sessionDuration: 0,
            engagementScore: 0.5
          }
        }
      })
    },
    
    setEducationalError: (error: EducationalError | null) => {
      set(state => ({
        learningSession: {
          ...state.learningSession,
          educationalError: error,
          isGeneratingExplanation: false
        }
      }))
    },
    
    updateLearningProgress: (progress: Partial<LearningProgress>) => {
      set(state => ({
        learningSession: {
          ...state.learningSession,
          learningProgress: {
            ...state.learningSession.learningProgress,
            ...progress,
            sessionDuration: Date.now() - state.learningSession.startTime.getTime()
          }
        }
      }))
    },
    
    // Educational analytics and progress tracking
    getRecentQueries: () => {
      const { learningSession } = get()
      return learningSession.messages.slice(-10) // Last 10 messages
    },
    
    getLearningSessionStats: () => {
      const { learningSession } = get()
      const duration = Date.now() - learningSession.startTime.getTime()
      return {
        queryCount: learningSession.messages.filter(m => m.role === 'user').length,
        sessionDuration: Math.floor(duration / 1000), // seconds
        conceptsExplored: learningSession.learningProgress.conceptsInProgress.length + 
                         learningSession.learningProgress.conceptsMastered.length
      }
    }
  }))
)

// Educational selectors for optimized component subscriptions
export const useLearningSession = () => useEducationalTutorStore(state => state.learningSession)
export const useMessages = () => useEducationalTutorStore(state => state.learningSession.messages)
export const useIsGeneratingExplanation = () => useEducationalTutorStore(state => state.learningSession.isGeneratingExplanation)
export const useEducationalError = () => useEducationalTutorStore(state => state.learningSession.educationalError)
export const useRecommendedVideos = () => useEducationalTutorStore(state => state.learningSession.recommendedVideos)
export const useSelectedEducationalVideo = () => useEducationalTutorStore(state => state.learningSession.selectedVideo)
export const useLearningProgress = () => useEducationalTutorStore(state => state.learningSession.learningProgress)

// Educational action selectors
export const useSubmitStudentQuery = () => useEducationalTutorStore(state => state.submitStudentQuery)
export const useUpdateCurrentQuery = () => useEducationalTutorStore(state => state.updateCurrentQuery)
export const useSelectEducationalVideo = () => useEducationalTutorStore(state => state.selectEducationalVideo)
export const useClearLearningSession = () => useEducationalTutorStore(state => state.clearLearningSession)
export const useSetEducationalError = () => useEducationalTutorStore(state => state.setEducationalError)
export const useUpdateLearningProgress = () => useEducationalTutorStore(state => state.updateLearningProgress)

// Export additional types for components
export type { ChatMessage } from '../types/api'
export type { VideoContent as VideoResult } from '../types/education'

// Backward compatibility exports (marked as deprecated)
/** @deprecated Use useEducationalTutorStore instead */
export const useChemTutorStore = useEducationalTutorStore
/** @deprecated Use useLearningSession instead */
export const useSession = useLearningSession
/** @deprecated Use useMessages instead */
export const useStudentQueries = useMessages
/** @deprecated Use useIsGeneratingExplanation instead */
export const useIsLoading = useIsGeneratingExplanation
/** @deprecated Use useEducationalError instead */
export const useError = useEducationalError
/** @deprecated Use useSubmitStudentQuery instead */
export const useSendMessage = useSubmitStudentQuery
/** @deprecated Use useUpdateCurrentQuery instead */
export const useSetCurrentQuery = useUpdateCurrentQuery
/** @deprecated Use useSelectEducationalVideo instead */
export const useSelectVideo = useSelectEducationalVideo
/** @deprecated Use useSetEducationalError instead */
export const useSetError = useSetEducationalError
/** @deprecated Use useRecommendedVideos instead */
export const useVideoResults = useRecommendedVideos
/** @deprecated Use useSelectedEducationalVideo instead */
export const useSelectedVideo = useSelectedEducationalVideo

// Development helpers for educational debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-expect-error - For debugging in development
  window.educationalTutorStore = useEducationalTutorStore
  // @ts-expect-error - Backward compatibility
  window.chemTutorStore = useEducationalTutorStore
}