'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Play, 
  Clock,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { 
  useMessages, 
  useIsLoading, 
  useError, 
  useSendMessage,
  useSetCurrentQuery,
  useSelectVideo,
  useSetError,
  ChatMessage,
  VideoResult
} from '@/lib/store'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messages = useMessages()
  const isLoading = useIsLoading()
  const error = useError()
  
  const sendMessage = useSendMessage()
  const setCurrentQuery = useSetCurrentQuery()
  const selectVideo = useSelectVideo()
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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white">
      {/* Premium Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">OrganicAI</h1>
          <p className="text-gray-600 mt-2">Your intelligent chemistry learning companion</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ask me anything about organic chemistry
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              I'll provide detailed explanations and find the perfect videos to help you master any chemistry concept
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm font-semibold text-gray-600 mb-2">Try asking:</div>
                <div className="text-gray-700">\"Explain SN1 vs SN2 reactions\"</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm font-semibold text-gray-600 mb-2">Or ask about:</div>
                <div className="text-gray-700">\"How does stereochemistry work?\"</div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className={cn(
              "max-w-[75%] rounded-2xl px-6 py-4 shadow-sm",
              message.role === 'user' 
                ? 'bg-black text-white ml-12' 
                : 'bg-white border border-gray-200 text-gray-900 mr-12'
            )}>
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {message.content}
              </div>
              
              {/* Video Results for AI messages */}
              {message.role === 'assistant' && message.videoResults && message.videoResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="text-base font-semibold text-gray-800 mb-4">
                    🎥 Related videos:
                  </div>
                  {message.videoResults.map((video: VideoResult) => (
                    <div
                      key={video.id}
                      className="flex space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => selectVideo(video)}
                    >
                      <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {video.title}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{video.duration}</span>
                          </div>
                          <span>•</span>
                          <span className="capitalize font-medium text-gray-600">{video.source}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mr-12 shadow-sm">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                <span className="text-base text-gray-700">Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-8 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="text-base text-red-800 mb-2">
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white p-8">
        <form onSubmit={handleSubmit} className="flex space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about organic chemistry concepts, reactions, or mechanisms..."
            disabled={isLoading}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-base shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="font-semibold">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  )
}
