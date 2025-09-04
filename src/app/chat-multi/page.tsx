'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Menu, Send, Loader2, Play, Clock, ArrowLeft, Zap, Brain, Video, Image, Music, Box } from 'lucide-react'
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar'
import { VideoPlayer } from '@/components/VideoPlayer'
import { MultimediaResponse } from '@/components/ai/MultimediaResponse'
import { useSelectedVideo, useMessages, useIsLoading, useError, useSendMessage, useSetCurrentQuery, useSelectVideo, useSetError, VideoResult } from '@/lib/store'
import { OrchestrationResult } from '@/lib/ai/types'
import { cn } from '@/lib/utils'

export default function MultiAIChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [currentChatId, setCurrentChatId] = useState<string | null>('multi-ai-1')
  const [multiAIEnabled, setMultiAIEnabled] = useState(true)
  const [currentQuery, setCurrentQuery] = useState<string>('')
  const selectedVideo = useSelectedVideo()
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [_orchestrationResult] = useState<OrchestrationResult | null>(null)

  // Store hooks
  const messages = useMessages()
  const isLoading = useIsLoading()
  const error = useError()
  const sendMessage = useSendMessage()
  const setCurrentQueryStore = useSetCurrentQuery()
  const selectVideo = useSelectVideo()
  const setError = useSetError()

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
    setCurrentQueryStore(message)
    // setOrchestrationResult(null) // TODO: Implement orchestration result state
    
    if (multiAIEnabled) {
      // Let MultimediaResponse handle the AI orchestration
    } else {
      try {
        await sendMessage(message)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }
  }

  const handleNewChat = () => {
    window.location.reload()
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleOrchestrationResult = (result: OrchestrationResult) => {
    setOrchestrationResult(result)
    // Optionally add to regular message store for history
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex overflow-hidden">
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
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold" style={{ color: '#1E0F2E' }}>
                  TradeAI Tutor
                </h1>
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Multi-AI</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">AI-Powered Visual Learning with 7+ AI Models</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Multi-AI Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Multi-AI Mode</span>
              <motion.button
                onClick={() => setMultiAIEnabled(!multiAIEnabled)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  multiAIEnabled ? "bg-gradient-to-r from-purple-500 to-blue-600" : "bg-gray-300"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute w-5 h-5 bg-white rounded-full top-0.5 shadow-sm"
                  animate={{ x: multiAIEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={cn(
                "w-2 h-2 rounded-full",
                multiAIEnabled ? "bg-gradient-to-r from-purple-500 to-blue-600" : "bg-green-500"
              )}></div>
              <span>{multiAIEnabled ? 'Multi-AI Online' : 'Standard Online'}</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {(!currentQuery && messages.length === 0) ? (
              /* Welcome Screen */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Multi-AI Learning Experience
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Ask me any plumbing question and I'll orchestrate multiple AI models to create 3D models, videos, diagrams, audio explanations, and more - all simultaneously!
                </p>

                {/* AI Services Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
                  <div className="p-4 bg-white rounded-xl shadow-sm border" aria-label="Image generation service">
                    <Image className="w-6 h-6 mx-auto mb-2 text-blue-600" aria-hidden="true" />
                    <div className="text-sm font-medium">DALL-E 3</div>
                    <div className="text-xs text-gray-500">Diagrams</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <Box className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">Tripo AI</div>
                    <div className="text-xs text-gray-500">3D Models</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <Video className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">Runway</div>
                    <div className="text-xs text-gray-500">Videos</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <Music className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium">ElevenLabs</div>
                    <div className="text-xs text-gray-500">Audio</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Example: Pipe Installation</h3>
                    <p className="text-sm text-gray-600">"How do I install a toilet flange?"</p>
                  </div>
                  <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Example: Joint Types</h3>
                    <p className="text-sm text-gray-600">"Show me different pipe joint types"</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Current Query Display */}
                {currentQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[80%] rounded-2xl px-6 py-4 shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <div className="text-base leading-relaxed">
                        {currentQuery}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Multi-AI Response */}
                {multiAIEnabled && currentQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[95%] rounded-2xl p-6 shadow-sm bg-white border border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Multi-AI Response</div>
                          <div className="text-sm text-gray-600">Orchestrating multiple AI models...</div>
                        </div>
                      </div>
                      
                      <MultimediaResponse 
                        query={currentQuery} 
                        onResult={handleOrchestrationResult}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Regular chat messages for fallback mode */}
                {!multiAIEnabled && messages.map((message, index) => (
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
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-white border border-gray-200'
                    )}>
                      <div className="text-base leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Video Results for AI messages */}
                      {message.role === 'assistant' && message.videoResults && message.videoResults.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <div className="text-base font-semibold mb-4 flex items-center text-gray-900">
                            <Play className="w-5 h-5 mr-2 text-purple-600" />
                            Related videos:
                          </div>
                          {message.videoResults.map((video: VideoResult) => (
                            <motion.div
                              key={video.id}
                              className="flex space-x-4 p-4 rounded-xl border border-purple-200 cursor-pointer group hover:bg-purple-50"
                              onClick={() => selectVideo(video)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-24 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-base font-semibold mb-1 text-gray-900">
                                  {video.title}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{video.duration}</span>
                                  </div>
                                  <span>•</span>
                                  <span className="capitalize font-medium">{video.source}</span>
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
                {!multiAIEnabled && isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
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
            <div className="text-base text-red-800 mb-2">
              {error?.message || 'An error occurred'}
            </div>
            {error?.recoveryActions && (
              <div className="text-sm text-red-600 mt-2">
                <p className="font-medium">Try:</p>
                <ul className="list-disc list-inside">
                  {error.recoveryActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="relative flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={multiAIEnabled 
                    ? "Ask me anything and I'll create 3D models, videos, diagrams & audio simultaneously..." 
                    : "Ask me anything about plumbing... (e.g., 'How do I install a toilet flange?')"
                  }
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 text-base shadow-sm resize-none"
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
                className="px-6 py-4 text-white rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-lg hover:shadow-xl disabled:shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : multiAIEnabled ? (
                  <div className="flex items-center space-x-1">
                    <Brain className="w-5 h-5" />
                    <Send className="w-4 h-4" />
                  </div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Enter to send, Shift + Enter for new line
              {multiAIEnabled && " • Multi-AI will generate 3D models, videos, diagrams & audio"}
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