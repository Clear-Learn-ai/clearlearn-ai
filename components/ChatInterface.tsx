'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Play, 
  Clock,
  Loader2
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
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="text-center">
          <h1 className="text-lg font-medium text-gray-900">OrganicAI</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Ask me anything about organic chemistry
            </h2>
            <p className="text-gray-600 text-lg">
              I'll help you understand concepts and find relevant videos
            </p>
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
              "max-w-[70%] rounded-2xl px-4 py-3",
              message.role === 'user' 
                ? 'bg-blue-500 text-white ml-12' 
                : 'bg-gray-100 text-gray-900 mr-12'
            )}>
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
              
              {/* Video Results for AI messages */}
              {message.role === 'assistant' && message.videoResults && message.videoResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Related videos:
                  </div>
                  {message.videoResults.map((video: VideoResult) => (
                    <div
                      key={video.id}
                      className="flex space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => selectVideo(video)}
                    >
                      <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <Play className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {video.title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span className="capitalize">{video.source}</span>
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
            <div className="bg-gray-100 rounded-2xl px-4 py-3 mr-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
      <div className="border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about organic chemistry..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  )
}
