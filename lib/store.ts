import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Types for the new video-augmented AI tutor
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  videoResults?: VideoResult[]
  aiExplanation?: string
}

export interface VideoResult {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  duration: string
  source: 'youtube' | 'khan-academy'
  relevance: number
}

export interface SessionState {
  sessionId: string
  startTime: Date
  messages: ChatMessage[]
  currentQuery: string
  isLoading: boolean
  error: string | null
  videoResults: VideoResult[]
  selectedVideo: VideoResult | null
}

interface ChemTutorStore {
  // Session state
  session: SessionState
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  setCurrentQuery: (query: string) => void
  selectVideo: (video: VideoResult) => void
  clearSession: () => void
  setError: (error: string | null) => void
  
  // Getters
  getRecentMessages: () => ChatMessage[]
  getSessionStats: () => { messageCount: number; duration: number }
}

export const useChemTutorStore = create<ChemTutorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    session: {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      messages: [],
      currentQuery: '',
      isLoading: false,
      error: null,
      videoResults: [],
      selectedVideo: null
    },
    
    // Actions
    sendMessage: async (content: string) => {
      const { session } = get()
      
      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content,
        timestamp: new Date()
      }
      
      set(state => ({
        session: {
          ...state.session,
          messages: [...state.session.messages, userMessage],
          isLoading: true,
          error: null,
          currentQuery: content
        }
      }))
      
      try {
        // Call AI API to get response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            sessionId: session.sessionId,
            conversationHistory: session.messages
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }
        
        const data = await response.json()
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: data.explanation,
          timestamp: new Date(),
          videoResults: data.videoResults,
          aiExplanation: data.explanation
        }
        
        set(state => ({
          session: {
            ...state.session,
            messages: [...state.session.messages, aiMessage],
            isLoading: false,
            videoResults: data.videoResults || []
          }
        }))
        
      } catch (error) {
        console.error('Error sending message:', error)
        set(state => ({
          session: {
            ...state.session,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to send message'
          }
        }))
      }
    },
    
    setCurrentQuery: (query: string) => {
      set(state => ({
        session: {
          ...state.session,
          currentQuery: query,
          error: null
        }
      }))
    },
    
    selectVideo: (video: VideoResult) => {
      set(state => ({
        session: {
          ...state.session,
          selectedVideo: video
        }
      }))
    },
    
    clearSession: () => {
      set({
        session: {
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startTime: new Date(),
          messages: [],
          currentQuery: '',
          isLoading: false,
          error: null,
          videoResults: [],
          selectedVideo: null
        }
      })
    },
    
    setError: (error: string | null) => {
      set(state => ({
        session: {
          ...state.session,
          error,
          isLoading: false
        }
      }))
    },
    
    // Getters
    getRecentMessages: () => {
      const { session } = get()
      return session.messages.slice(-10) // Last 10 messages
    },
    
    getSessionStats: () => {
      const { session } = get()
      const duration = Date.now() - session.startTime.getTime()
      return {
        messageCount: session.messages.length,
        duration: Math.floor(duration / 1000) // seconds
      }
    }
  }))
)

// Selectors for optimized component subscriptions
export const useSession = () => useChemTutorStore(state => state.session)
export const useMessages = () => useChemTutorStore(state => state.session.messages)
export const useIsLoading = () => useChemTutorStore(state => state.session.isLoading)
export const useError = () => useChemTutorStore(state => state.session.error)
export const useVideoResults = () => useChemTutorStore(state => state.session.videoResults)
export const useSelectedVideo = () => useChemTutorStore(state => state.session.selectedVideo)

// Action selectors
export const useSendMessage = () => useChemTutorStore(state => state.sendMessage)
export const useSetCurrentQuery = () => useChemTutorStore(state => state.setCurrentQuery)
export const useSelectVideo = () => useChemTutorStore(state => state.selectVideo)
export const useClearSession = () => useChemTutorStore(state => state.clearSession)
export const useSetError = () => useChemTutorStore(state => state.setError)

// Development helpers
if (typeof window !== 'undefined') {
  // @ts-expect-error - For debugging in development
  window.chemTutorStore = useChemTutorStore
}