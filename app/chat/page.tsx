'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChatInterface } from '@/components/ChatInterface'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useSelectedVideo } from '@/lib/store'
import { ArrowLeft, Home } from 'lucide-react'

export default function ChemistryChatPage() {
  const selectedVideo = useSelectedVideo()
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // Open video player when a video is selected
  useEffect(() => {
    if (selectedVideo && !isVideoOpen) {
      setIsVideoOpen(true)
    }
  }, [selectedVideo, isVideoOpen])

  const handleCloseVideo = () => {
    setIsVideoOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <div className="text-gray-300">•</div>
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 font-medium">AI Tutor Session</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💡 <span className="font-medium">Tip:</span> Ask specific questions for better results
            </div>
          </div>
        </div>
      </div>

      {/* Main chat interface */}
      <div className="h-screen flex flex-col pt-16">
        <div className="flex-1 max-w-6xl mx-auto w-full">
          <ChatInterface />
        </div>
      </div>
      
      {/* Video player modal */}
      <VideoPlayer
        video={selectedVideo}
        isOpen={isVideoOpen}
        onClose={handleCloseVideo}
      />
      
      {/* Floating help button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group">
          <span className="text-xl">🧪</span>
          <div className="absolute right-14 bottom-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            OrganicAI Help
          </div>
        </button>
      </div>
    </div>
  )
}
