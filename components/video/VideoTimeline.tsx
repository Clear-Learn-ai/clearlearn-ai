'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Clock, Wrench, AlertTriangle } from 'lucide-react'
import { PlumbingStep, VideoFrame } from '@/lib/video/youtubeProcessor'

interface VideoTimelineProps {
  steps: PlumbingStep[]
  duration: number
  currentTime: number
  onTimeSeek: (time: number) => void
  onStepSelect: (step: PlumbingStep) => void
  isPlaying: boolean
  onPlayPause: () => void
}

interface TimelineEvent {
  timestamp: number
  type: 'step' | 'frame' | 'tool' | 'warning'
  title: string
  description?: string
  color: string
  step?: PlumbingStep
  frame?: VideoFrame
}

export function VideoTimeline({ 
  steps, 
  duration, 
  currentTime, 
  onTimeSeek, 
  onStepSelect,
  isPlaying,
  onPlayPause 
}: VideoTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Generate timeline events from steps
  const events: TimelineEvent[] = React.useMemo(() => {
    const timelineEvents: TimelineEvent[] = []

    steps.forEach((step, index) => {
      // Add step marker
      timelineEvents.push({
        timestamp: step.startTime,
        type: 'step',
        title: `Step ${step.stepNumber}: ${step.title}`,
        description: step.description,
        color: 'bg-blue-500',
        step,
      })

      // Add key frames
      step.frames.filter(frame => frame.isKeyFrame).forEach(frame => {
        timelineEvents.push({
          timestamp: frame.timestamp,
          type: 'frame',
          title: 'Key Frame',
          description: frame.description || 'Important visual moment',
          color: 'bg-green-400',
          frame,
        })
      })

      // Add tool usage markers
      if (step.tools && step.tools.length > 0) {
        timelineEvents.push({
          timestamp: step.startTime + (step.endTime - step.startTime) * 0.3,
          type: 'tool',
          title: `Tools: ${step.tools.join(', ')}`,
          description: `Tools used in ${step.title}`,
          color: 'bg-orange-500',
          step,
        })
      }

      // Add warning markers
      if (step.warnings && step.warnings.length > 0) {
        timelineEvents.push({
          timestamp: step.startTime + (step.endTime - step.startTime) * 0.7,
          type: 'warning',
          title: 'Safety Warning',
          description: step.warnings.join(', '),
          color: 'bg-red-500',
          step,
        })
      }
    })

    return timelineEvents.sort((a, b) => a.timestamp - b.timestamp)
  }, [steps])

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const timelineWidth = rect.width
    const clickedTime = (clickX / timelineWidth) * duration
    
    onTimeSeek(clickedTime)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'step': return <div className="w-2 h-2 rounded-full bg-blue-500" />
      case 'frame': return <div className="w-2 h-2 rounded-full bg-green-400" />
      case 'tool': return <Wrench className="w-3 h-3 text-orange-500" />
      case 'warning': return <AlertTriangle className="w-3 h-3 text-red-500" />
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />
    }
  }

  const currentStep = steps.find(step => 
    currentTime >= step.startTime && currentTime <= step.endTime
  )

  return (
    <div className="bg-gray-900 text-white rounded-lg p-4 space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          
          <button 
            onClick={() => onTimeSeek(Math.max(0, currentTime - 10))}
            className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onTimeSeek(Math.min(duration, currentTime + 10))}
            className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Current Step Info */}
      {currentStep && (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-blue-400">Current Step</span>
          </div>
          <h3 className="font-medium mb-1">{currentStep.title}</h3>
          <p className="text-sm text-gray-300">{currentStep.description}</p>
          {currentStep.tools && currentStep.tools.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">{currentStep.tools.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">Video Timeline</div>
        
        {/* Progress bar */}
        <div 
          ref={timelineRef}
          className="relative h-12 bg-gray-800 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHoveredEvent(null)}
        >
          {/* Step backgrounds */}
          {steps.map((step, index) => (
            <div
              key={`step-bg-${index}`}
              className="absolute top-0 h-full bg-gray-700 opacity-50 border-l border-r border-gray-600"
              style={{
                left: `${(step.startTime / duration) * 100}%`,
                width: `${((step.endTime - step.startTime) / duration) * 100}%`,
              }}
            />
          ))}

          {/* Progress indicator */}
          <div 
            className="absolute top-0 h-full bg-blue-600 transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Timeline events */}
          {events.map((event, index) => (
            <div
              key={index}
              className="absolute top-1 bottom-1 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              style={{ left: `${(event.timestamp / duration) * 100}%` }}
              onMouseEnter={() => setHoveredEvent(event)}
              onClick={(e) => {
                e.stopPropagation()
                if (event.step) {
                  onStepSelect(event.step)
                }
                onTimeSeek(event.timestamp)
              }}
            >
              {getEventIcon(event.type)}
            </div>
          ))}

          {/* Current time indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Step markers with labels */}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => {
                onStepSelect(step)
                onTimeSeek(step.startTime)
              }}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                currentStep?.stepNumber === step.stepNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
                    {formatTime(step.startTime)}
                  </span>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {step.tools && step.tools.length > 0 && (
                    <Wrench className="w-3 h-3 text-orange-400" />
                  )}
                  {step.warnings && step.warnings.length > 0 && (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredEvent && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700 max-w-xs pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
          }}
        >
          <div className="font-medium">{hoveredEvent.title}</div>
          {hoveredEvent.description && (
            <div className="text-gray-300 mt-1">{hoveredEvent.description}</div>
          )}
          <div className="text-gray-400 text-xs mt-1">
            {formatTime(hoveredEvent.timestamp)}
          </div>
        </div>
      )}
    </div>
  )
}