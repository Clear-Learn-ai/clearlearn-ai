'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, Send, Loader2, Play, Clock, Sparkles, MessageSquare } from 'lucide-react'
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar'
import { VideoPlayer } from '@/components/VideoPlayer'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'
import { useSelectedVideo, useMessages, useIsLoading, useError, useSendMessage, useSetCurrentQuery, useSelectVideo, useSetError, ChatMessage, VideoResult } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [currentChatId, setCurrentChatId] = useState<string | null>('1')
  const selectedVideo = useSelectedVideo()
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // Store hooks
  const messages = useMessages()
  const isLoading = useIsLoading()
  const error = useError()
  const sendMessage = useSendMessage()
  const setCurrentQuery = useSetCurrentQuery()
  const selectVideo = useSelectVideo()
  const setError = useSetError()

  // Sample suggested questions for different subjects
  const suggestedQuestions = [
    "How does photosynthesis work?",
    "Explain the water cycle",
    "What is DNA and how does it work?",
    "How do vaccines work?",
    "Explain Newton's laws of motion"
  ]

  useEffect(() => {
    if (selectedVideo && !isVideoOpen) {
      setIsVideoOpen(true)
    }
  }, [selectedVideo, isVideoOpen])

  const handleCloseVideo = () => {
    setIsVideoOpen(false)
  }

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
    // Auto-submit the question
    setCurrentQuery(question)
    sendMessage(question)
  }

  const handleNewChat = () => {
    // Reset the current chat state
    window.location.reload() // Simple approach - you might want to implement proper state reset
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    // Load chat history for the selected chat
    // This would typically fetch from your backend
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-white flex overflow-hidden">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Clearlearn
              </h1>
              <p className="text-sm text-gray-600">AI-Powered Learning Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-4xl mx-auto p-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Ready to learn anything?
                </h2>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                  Ask me any question and I'll provide clear explanations with relevant videos to help you understand
                </p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-900 font-medium">{question}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Chat Messages */
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-white border border-gray-200'
                    )}>
                      <div className="text-base leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Video Results for AI messages */}
                      {message.role === 'assistant' && message.videoResults && message.videoResults.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <div className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                            <Play className="w-5 h-5 mr-2 text-blue-600" />
                            Related videos:
                          </div>
                          {message.videoResults.map((video: VideoResult) => (
                            <motion.div
                              key={video.id}
                              className="flex space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:border-blue-200 cursor-pointer group"
                              onClick={() => selectVideo(video)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-24 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Play className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                  {video.title}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{video.duration}</span>
                                  </div>
                                  <span>•</span>
                                  <span className="capitalize font-medium text-blue-600">{video.source}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-base text-gray-700">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="text-base text-red-800 mb-2">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about any subject..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-base shadow-sm resize-none"
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-lg hover:shadow-xl disabled:shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </form>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        video={selectedVideo}
        isOpen={isVideoOpen}
        onClose={handleCloseVideo}
      />
    </div>
  )
}