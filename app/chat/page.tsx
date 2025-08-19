'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useSelectedVideo } from '@/lib/store'

export default function ChemistryChatPage() {
  const selectedVideo = useSelectedVideo()
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // Open video player when a video is selected
  useState(() => {
    if (selectedVideo && !isVideoOpen) {
      setIsVideoOpen(true)
    }
  })

  const handleCloseVideo = () => {
    setIsVideoOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        <ChatInterface />
      </div>
      
      <VideoPlayer
        video={selectedVideo}
        isOpen={isVideoOpen}
        onClose={handleCloseVideo}
      />
    </div>
  )
}
