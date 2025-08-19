'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  MessageSquare, 
  Video, 
  Play, 
  Clock, 
  ExternalLink,
  Bot,
  User,
  Loader2,
  Beaker
} from 'lucide-react'
import { 
  useMessages, 
  useIsLoading, 
  useError, 
  useVideoResults,
  useSelectedVideo,
  useSendMessage,
  useSetCurrentQuery,
  useSelectVideo,
  useClearSession,
  useSetError,
  ChatMessage,
  VideoResult
} from '@/lib/store'
import { cn } from '@/lib/utils'

const SUGGESTED_QUESTIONS = [
  {
    category: "Mechanisms",
    questions: [
      'Explain SN1 vs SN2 reactions with examples',
      'How does benzene aromatic substitution work?',
      'Show me aldol condensation mechanism',
      'What is the E1 vs E2 elimination mechanism?'
    ]
  },
  {
    category: "Stereochemistry", 
    questions: [
      'How do I determine R and S configuration?',
      'What is the difference between enantiomers and diastereomers?',
      'Explain optical activity and specific rotation',
      'How do I identify chiral centers?'
    ]
  },
  {
    category: "Spectroscopy",
    questions: [
      'How do I read an NMR spectrum?',
      'What are the key IR spectroscopy peaks?',
      'How does mass spectrometry work for organic compounds?',
      'Interpret this UV-Vis spectrum'
    ]
  },
  {
    category: "Synthesis",
    questions: [
      'What are the steps in retrosynthesis?',
      'How do I plan a multi-step synthesis?',
      'What are the best protecting groups to use?',
      'Design a synthesis for aspirin'
    ]
  }
]

export function ChatInterface() {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messages = useMessages()
  const isLoading = useIsLoading()
  const error = useError()
  const videoResults = useVideoResults()
  const selectedVideo = useSelectedVideo()
  
  const sendMessage = useSendMessage()
  const setCurrentQuery = useSetCurrentQuery()
  const selectVideo = useSelectVideo()
  const clearSession = useClearSession()
  const setError = useSetError()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    setCurrentQuery(message)
    
    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Beaker className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">OrganicAI Tutor</h1>
              <p className="text-blue-100 text-sm">Your Personal Organic Chemistry Expert</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">Study Session</div>
              <div className="text-xs text-blue-100">{messages.length} messages</div>
            </div>
            <button
              onClick={clearSession}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
            >
              New Session
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to OrganicAI Tutor! 🧪
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Your personal AI tutor for organic chemistry. Ask questions, get expert explanations, 
              and watch curated videos to master complex concepts. Perfect for pre-med students!
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-500">Reactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-500">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-500">Available</div>
              </div>
            </div>
            
            {/* Categorized Suggested Questions */}
            <div className="max-w-4xl mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Topics - Click to ask:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUGGESTED_QUESTIONS.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-2"></span>
                      {category.category}
                    </h5>
                    <div className="space-y-2">
                      {category.questions.map((question, questionIndex) => (
                        <button
                          key={questionIndex}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left text-sm p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex space-x-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200'
                )}>
                  <div className="prose prose-sm max-w-none">
                    <div className={cn(
                      "whitespace-pre-wrap",
                      message.role === 'user' ? 'text-white' : 'text-gray-900'
                    )}>
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Video Results for AI messages */}
                  {message.role === 'assistant' && message.videoResults && message.videoResults.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                      <div className="flex items-center mb-4">
                        <Video className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-semibold text-gray-800">
                          Recommended Videos for Visual Learning
                        </span>
                      </div>
                      <div className="space-y-3">
                        {message.videoResults.map((video: VideoResult) => (
                          <div
                            key={video.id}
                            className="flex space-x-4 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200"
                            onClick={() => selectVideo(video)}
                          >
                            <div className="w-24 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-green-200">
                              <Play className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                {video.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {video.description}
                              </p>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 font-medium">{video.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${video.source === 'youtube' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                  <span className="text-xs text-gray-500 capitalize font-medium">{video.source}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-blue-600 font-medium">Watch</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-600 text-center">
                        💡 Click any video to watch it in our integrated player
                      </div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "text-xs mt-2",
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  )}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about SN2 reactions, stereochemistry, NMR spectra, synthesis..."
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 shadow-sm"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? 'Thinking...' : 'Ask AI'}
            </span>
          </button>
        </form>
        
        {/* Quick Action Buttons */}
        {messages.length > 0 && (
          <div className="flex justify-center space-x-2 mt-3">
            <button
              onClick={() => setInputValue('Can you explain that differently?')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              Explain differently
            </button>
            <button
              onClick={() => setInputValue('Show me more examples')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              More examples
            </button>
            <button
              onClick={() => setInputValue('Give me practice problems')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              Practice problems
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
