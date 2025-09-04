'use client'

import React, { useState, useRef } from 'react'
import { Upload, Play, Pause, Download, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { YouTubeVideoProcessor, ProcessedVideo } from '@/lib/video/youtubeProcessor'
import { VideoTimeline } from './VideoTimeline'
import ReactPlayer from 'react-player'

interface VideoAnalyzerProps {
  onVideoProcessed?: (video: ProcessedVideo) => void
}

export function VideoAnalyzer({ onVideoProcessed }: VideoAnalyzerProps) {
  const [videoUrl, setVideoUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  
  const playerRef = useRef<ReactPlayer>(null)
  const processorRef = useRef<YouTubeVideoProcessor>(new YouTubeVideoProcessor())

  const handleProcessVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    setIsProcessing(true)
    setError('')
    setProcessedVideo(null)

    try {
      const processor = processorRef.current
      const result = await processor.processVideo(videoUrl)
      
      setProcessedVideo(result)
      onVideoProcessed?.(result)
      
    } catch (err) {
      console.error('Error processing video:', err)
      setError(err instanceof Error ? err.message : 'Failed to process video')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTimeSeek = (time: number) => {
    setCurrentTime(time)
    playerRef.current?.seekTo(time, 'seconds')
  }

  const handleStepSelect = (step: any) => {
    setSelectedStep(step.stepNumber)
    handleTimeSeek(step.startTime)
  }

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds)
  }

  const getTargetChannels = () => {
    return processorRef.current.getTargetChannels()
  }

  const exportData = () => {
    if (!processedVideo) return
    
    const dataStr = JSON.stringify(processedVideo, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${processedVideo.id}_analysis.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2">YouTube Video Analyzer</h1>
        <p className="text-blue-100">
          Extract key frames, transcripts, and step-by-step instructions from plumbing videos
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Process YouTube Video</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                onClick={handleProcessVideo}
                disabled={isProcessing || !videoUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Channels Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Target Plumbing Channels:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {getTargetChannels().map((channel, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{channel.name}</span>
                  <span className="text-gray-500">({channel.skillLevel})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            <h3 className="text-lg font-semibold text-blue-800">Processing Video...</h3>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <div>• Extracting video metadata</div>
            <div>• Downloading video for analysis</div>
            <div>• Processing transcript and captions</div>
            <div>• Extracting key frames using AI</div>
            <div>• Identifying plumbing steps and procedures</div>
            <div>• Generating summary and categorization</div>
          </div>
        </div>
      )}

      {/* Results */}
      {processedVideo && (
        <div className="space-y-6">
          {/* Video Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{processedVideo.metadata.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Channel: {processedVideo.metadata.channel}</span>
                  <span>Duration: {Math.floor(processedVideo.metadata.duration / 60)}m {Math.floor(processedVideo.metadata.duration % 60)}s</span>
                  <span className="capitalize">Skill Level: {processedVideo.skillLevel}</span>
                  <span className="capitalize">Category: {processedVideo.category}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <a
                  href={processedVideo.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Watch</span>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-gray-700">{processedVideo.summary}</p>
            </div>

            {processedVideo.relatedComponents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {processedVideo.relatedComponents.map((component, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {component}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Video Player and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <ReactPlayer
                  ref={playerRef}
                  url={processedVideo.metadata.url}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  onProgress={handleProgress}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls={true}
                />
              </div>
            </div>

            {/* Steps Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Steps Overview ({processedVideo.plumbingSteps.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {processedVideo.plumbingSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepSelect(step)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedStep === step.stepNumber
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{step.title}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {Math.floor(step.startTime / 60)}:{(step.startTime % 60).toFixed(0).padStart(2, '0')} - 
                      {Math.floor(step.endTime / 60)}:{(step.endTime % 60).toFixed(0).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-700">{step.description}</div>
                    
                    {(step.tools && step.tools.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.tools.map((tool, i) => (
                          <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Timeline */}
          <VideoTimeline
            steps={processedVideo.plumbingSteps}
            duration={processedVideo.metadata.duration}
            currentTime={currentTime}
            onTimeSeek={handleTimeSeek}
            onStepSelect={handleStepSelect}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
          />

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{processedVideo.plumbingSteps.length}</div>
              <div className="text-sm text-blue-800">Steps Identified</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {processedVideo.keyFrames.filter(f => f.isKeyFrame).length}
              </div>
              <div className="text-sm text-green-800">Key Frames</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {processedVideo.plumbingSteps.reduce((acc, step) => acc + (step.tools?.length || 0), 0)}
              </div>
              <div className="text-sm text-orange-800">Tools Mentioned</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {processedVideo.plumbingSteps.reduce((acc, step) => acc + (step.warnings?.length || 0), 0)}
              </div>
              <div className="text-sm text-red-800">Safety Warnings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}