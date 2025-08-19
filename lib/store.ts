import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { LearningEngine } from '@/core/LearningEngine'
import { 
  LearningQuery, 
  GeneratedContent, 
  FeedbackData, 
  SessionMetrics, 
  UserProgress 
} from '@/core/types'

interface LearningState {
  // Core engine
  engine: LearningEngine
  
  // Current session state
  currentQuery: string
  isGenerating: boolean
  currentContent: GeneratedContent | null
  error: string | null
  
  // Learning history
  queryHistory: LearningQuery[]
  contentHistory: GeneratedContent[]
  feedbackHistory: FeedbackData[]
  
  // Session metrics
  sessionMetrics: SessionMetrics | null
  
  // User preferences (would be loaded from API in production)
  userProgress: UserProgress | null
  
  // Actions
  setQuery: (query: string) => void
  generateContent: (query: string) => Promise<void>
  submitFeedback: (feedback: Omit<FeedbackData, 'timestamp'>) => void
  clearError: () => void
  resetSession: () => void
  
  // Getters
  getRecentQueries: () => LearningQuery[]
  getSessionStats: () => SessionMetrics
}

export const useLearningStore = create<LearningState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    engine: new LearningEngine(),
    currentQuery: '',
    isGenerating: false,
    currentContent: null,
    error: null,
    queryHistory: [],
    contentHistory: [],
    feedbackHistory: [],
    sessionMetrics: null,
    userProgress: null,
    
    // Actions
    setQuery: (query: string) => {
      set({ currentQuery: query, error: null })
    },
    
    generateContent: async (query: string) => {
      const { engine } = get()
      
      set({ 
        isGenerating: true, 
        error: null,
        currentQuery: query 
      })
      
      try {
        const content = await engine.processQuery(query)
        
        set(state => ({
          isGenerating: false,
          currentContent: content,
          contentHistory: [...state.contentHistory, content],
          sessionMetrics: engine.getSessionMetrics()
        }))
        
      } catch (error) {
        console.error('Content generation failed:', error)
        set({ 
          isGenerating: false, 
          error: error instanceof Error ? error.message : 'Failed to generate content',
          currentContent: null
        })
      }
    },
    
    submitFeedback: (feedback: Omit<FeedbackData, 'timestamp'>) => {
      const { engine } = get()
      
      const fullFeedback: FeedbackData = {
        ...feedback,
        timestamp: new Date()
      }
      
      // Record feedback in engine
      engine.recordFeedback(fullFeedback)
      
      // Update store state
      set(state => ({
        feedbackHistory: [...state.feedbackHistory, fullFeedback],
        sessionMetrics: engine.getSessionMetrics()
      }))
      
      // In production, would also send to analytics/adaptation system
      console.log('Feedback submitted:', fullFeedback)
    },
    
    clearError: () => {
      set({ error: null })
    },
    
    resetSession: () => {
      const newEngine = new LearningEngine()
      set({
        engine: newEngine,
        currentQuery: '',
        isGenerating: false,
        currentContent: null,
        error: null,
        queryHistory: [],
        contentHistory: [],
        feedbackHistory: [],
        sessionMetrics: null
      })
    },
    
    // Getters
    getRecentQueries: () => {
      const { queryHistory } = get()
      return queryHistory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    },
    
    getSessionStats: () => {
      const { engine } = get()
      return engine.getSessionMetrics()
    }
  }))
)

// Selectors for optimized component subscriptions
export const useCurrentQuery = () => useLearningStore(state => state.currentQuery)
export const useIsGenerating = () => useLearningStore(state => state.isGenerating)
export const useCurrentContent = () => useLearningStore(state => state.currentContent)
export const useError = () => useLearningStore(state => state.error)
export const useSessionMetrics = () => useLearningStore(state => state.sessionMetrics)

// Action selectors
export const useGenerateContent = () => useLearningStore(state => state.generateContent)
export const useSubmitFeedback = () => useLearningStore(state => state.submitFeedback)
export const useSetQuery = () => useLearningStore(state => state.setQuery)
export const useClearError = () => useLearningStore(state => state.clearError)

// Development helpers
if (typeof window !== 'undefined') {
  // @ts-expect-error - For debugging in development
  window.learningStore = useLearningStore
}