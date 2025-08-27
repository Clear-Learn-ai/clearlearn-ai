'use client'

import React from 'react'
import { VideoAnalyzer } from '@/components/video/VideoAnalyzer'
import { ProcessedVideo } from '@/lib/video/youtubeProcessor'
import { useProcessYouTubeVideo, useProcessedVideos } from '@/lib/store'

export default function VideoPage() {
  const processYouTubeVideo = useProcessYouTubeVideo()
  const processedVideos = useProcessedVideos()

  const handleVideoProcessed = (video: ProcessedVideo) => {
    console.log('Video processed successfully:', video.metadata.title)
    console.log(`Found ${video.plumbingSteps.length} plumbing steps`)
    console.log(`Extracted ${video.keyFrames.filter(f => f.isKeyFrame).length} key frames`)
    
    // Update the global store state
    // The video is already added to the store via the processYouTubeVideo function
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">TradeAI Tutor</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Video Analysis
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Processed Videos: {processedVideos.length}</span>
              <a 
                href="/" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back to Learning
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <VideoAnalyzer onVideoProcessed={handleVideoProcessed} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">TradeAI Tutor - Plumbing Education Platform</p>
            <p className="text-sm">
              Powered by advanced AI video analysis for hands-on plumbing training
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}