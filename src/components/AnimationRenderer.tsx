'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimationData, CanvasElement, ContentMetadata } from '@/core/types'
import { cn } from '@/lib/utils'

interface AnimationRendererProps {
  data: AnimationData
  metadata: ContentMetadata
}

export function AnimationRenderer({ data, metadata }: AnimationRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepProgress, setStepProgress] = useState(0)
  const [, setAnimationTime] = useState(0)
  
  const currentStep = data.steps[currentStepIndex]
  
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: CanvasElement, progress: number = 1) => {
    const { type, position, properties, animation } = element
    
    ctx.save()
    
    // Apply animation transforms
    if (animation && progress < 1) {
      const animProgress = easeFunction(progress, animation.easing || 'ease-in-out')
      applyAnimation(ctx, animation, animProgress, position)
    } else {
      ctx.translate(position.x, position.y)
    }
    
    // Draw based on element type
    switch (type) {
      case 'text':
        drawText(ctx, properties)
        break
      case 'circle':
        drawCircle(ctx, properties)
        break
      case 'rectangle':
        drawRectangle(ctx, properties)
        break
      case 'ellipse':
        drawEllipse(ctx, properties)
        break
      case 'path':
        drawPath(ctx, properties)
        break
      case 'arrow':
        drawArrow(ctx, properties)
        break
    }
    
    ctx.restore()
  }, [])
  
  const drawText = (ctx: CanvasRenderingContext2D, props: any) => {
    ctx.font = `${props.fontWeight || 'normal'} ${props.fontSize || 16}px ${props.fontFamily || 'Inter, sans-serif'}`
    ctx.fillStyle = props.color || '#000000'
    ctx.textAlign = props.textAlign || 'left'
    ctx.textBaseline = 'middle'
    
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity
    }
    
    ctx.fillText(props.text, 0, 0)
  }
  
  const drawCircle = (ctx: CanvasRenderingContext2D, props: any) => {
    ctx.beginPath()
    ctx.arc(0, 0, props.radius || 10, 0, 2 * Math.PI)
    
    if (props.fillColor && props.fillColor !== 'none') {
      ctx.fillStyle = props.fillColor
      ctx.fill()
    }
    
    if (props.strokeColor) {
      ctx.strokeStyle = props.strokeColor
      ctx.lineWidth = props.strokeWidth || 1
      ctx.stroke()
    }
    
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity
    }
  }
  
  const drawRectangle = (ctx: CanvasRenderingContext2D, props: any) => {
    const width = props.width || 50
    const height = props.height || 30
    const x = -width / 2
    const y = -height / 2
    
    if (props.borderRadius) {
      drawRoundedRect(ctx, x, y, width, height, props.borderRadius)
    } else {
      ctx.rect(x, y, width, height)
    }
    
    if (props.fillColor && props.fillColor !== 'none') {
      ctx.fillStyle = props.fillColor
      ctx.fill()
    }
    
    if (props.strokeColor) {
      ctx.strokeStyle = props.strokeColor
      ctx.lineWidth = props.strokeWidth || 1
      ctx.stroke()
    }
    
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity
    }
  }
  
  const drawEllipse = (ctx: CanvasRenderingContext2D, props: any) => {
    const radiusX = (props.width || 40) / 2
    const radiusY = (props.height || 20) / 2
    
    ctx.beginPath()
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI)
    
    if (props.fillColor && props.fillColor !== 'none') {
      ctx.fillStyle = props.fillColor
      ctx.fill()
    }
    
    if (props.strokeColor) {
      ctx.strokeStyle = props.strokeColor
      ctx.lineWidth = props.strokeWidth || 1
      ctx.stroke()
    }
    
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity
    }
  }
  
  const drawPath = (ctx: CanvasRenderingContext2D, props: any) => {
    const path = new Path2D(props.path)
    
    if (props.fillColor && props.fillColor !== 'none') {
      ctx.fillStyle = props.fillColor
      ctx.fill(path)
    }
    
    if (props.strokeColor) {
      ctx.strokeStyle = props.strokeColor
      ctx.lineWidth = props.strokeWidth || 1
      ctx.stroke(path)
    }
    
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity
    }
  }
  
  const drawArrow = (ctx: CanvasRenderingContext2D, props: any) => {
    const length = props.length || 50
    const headSize = props.headSize || 10
    
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(length, 0)
    
    // Arrow head
    ctx.moveTo(length - headSize, -headSize / 2)
    ctx.lineTo(length, 0)
    ctx.lineTo(length - headSize, headSize / 2)
    
    ctx.strokeStyle = props.color || '#000000'
    ctx.lineWidth = props.width || 2
    ctx.stroke()
  }
  
  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()
  }
  
  const applyAnimation = (ctx: CanvasRenderingContext2D, animation: any, progress: number, position: { x: number; y: number }) => {
    const { type, from, to } = animation
    
    switch (type) {
      case 'fade':
        const opacity = lerp(from.opacity || 0, to.opacity || 1, progress)
        ctx.globalAlpha = opacity
        ctx.translate(position.x, position.y)
        break
        
      case 'move':
        const x = lerp(from.x || position.x, to.x || position.x, progress)
        const y = lerp(from.y || position.y, to.y || position.y, progress)
        ctx.translate(x, y)
        break
        
      case 'scale':
        const scale = lerp(from.scale || 0, to.scale || 1, progress)
        ctx.translate(position.x, position.y)
        ctx.scale(scale, scale)
        break
        
      case 'rotate':
        const rotation = lerp(from.rotation || 0, to.rotation || 0, progress)
        ctx.translate(position.x, position.y)
        ctx.rotate(rotation)
        break
        
      default:
        ctx.translate(position.x, position.y)
    }
  }
  
  const easeFunction = (t: number, easing: string): number => {
    switch (easing) {
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
      case 'linear':
      default:
        return t
    }
  }
  
  const lerp = (start: number, end: number, t: number): number => {
    return start + (end - start) * t
  }
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentStep) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set background
    ctx.fillStyle = data.canvas.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw elements
    currentStep.elements.forEach(element => {
      const elementProgress = element.animation ? 
        Math.min(1, stepProgress * (currentStep.duration / (element.animation.duration || 1000))) : 1
      
      drawElement(ctx, element, elementProgress)
    })
  }, [currentStep, stepProgress, data.canvas.backgroundColor, drawElement])
  
  const startAnimation = useCallback(() => {
    if (!currentStep) return
    
    setIsPlaying(true)
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / currentStep.duration)
      
      setStepProgress(progress)
      setAnimationTime(elapsed)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        // Auto-advance to next step after a brief pause
        setTimeout(() => {
          if (currentStepIndex < data.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
            setStepProgress(0)
          }
        }, 500)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [currentStep, currentStepIndex, data.steps.length])
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)
  }, [])
  
  const resetAnimation = useCallback(() => {
    stopAnimation()
    setCurrentStepIndex(0)
    setStepProgress(0)
    setAnimationTime(0)
  }, [stopAnimation])
  
  const goToStep = (stepIndex: number) => {
    stopAnimation()
    setCurrentStepIndex(stepIndex)
    setStepProgress(0)
    setAnimationTime(0)
  }
  
  // Setup canvas and start first animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = data.canvas.width
    canvas.height = data.canvas.height
    
    // Start first step automatically
    if (currentStepIndex === 0 && !isPlaying) {
      setTimeout(startAnimation, 500)
    }
  }, [data.canvas, currentStepIndex, isPlaying, startAnimation])
  
  // Render current frame
  useEffect(() => {
    renderFrame()
  }, [renderFrame])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Animation Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metadata.title}</h3>
        <p className="text-sm text-gray-600">{metadata.description}</p>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-lg border overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full"
          style={{ 
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '400px'
          }}
        />
      </div>
      
      {/* Controls */}
      <div className="mt-4 space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-100"
            style={{ 
              width: `${(currentStepIndex / data.steps.length + stepProgress / data.steps.length) * 100}%` 
            }}
          />
        </div>
        
        {/* Current Step Info */}
        {currentStep && (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              Step {currentStepIndex + 1} of {data.steps.length}
            </div>
            {currentStep.narration && (
              <div className="text-sm text-gray-600 mt-1">
                {currentStep.narration}
              </div>
            )}
          </div>
        )}
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetAnimation}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Reset to beginning"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={() => goToStep(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={isPlaying ? stopAnimation : startAnimation}
            className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => goToStep(Math.min(data.steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === data.steps.length - 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Step Navigation */}
        <div className="flex justify-center gap-2">
          {data.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === currentStepIndex 
                  ? "bg-primary-600" 
                  : index < currentStepIndex 
                    ? "bg-primary-300" 
                    : "bg-gray-300"
              )}
              title={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}