import React from 'react'
import { Play, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl?: string
  title?: string
  className?: string
}

export function VideoPlayer({ videoUrl, title = "Video", className = "" }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No video available</p>
        </div>
      </div>
    )
  }

  // Simple video player using iframe for YouTube or basic video element for others
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      {isYouTube ? (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
          className="w-full h-full min-h-[300px]"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      ) : (
        <video
          src={videoUrl}
          controls
          className="w-full h-full min-h-[300px]"
          poster="/api/placeholder/400/300"
        >
          Your browser does not support the video tag.
        </video>
      )}

      <div className="p-4 bg-gray-900">
        <h3 className="text-white font-medium">{title}</h3>
      </div>
    </div>
  )
}

function getYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length == 11) ? match[2] : ''
}