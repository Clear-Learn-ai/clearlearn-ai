'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useSelectedVideo } from '@/lib/store'

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
    <div className="min-h-screen bg-white">
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
