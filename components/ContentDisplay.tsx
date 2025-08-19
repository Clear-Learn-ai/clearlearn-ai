'use client'

import { useCurrentContent, useIsGenerating, useError } from '@/lib/store'
import { AnimationRenderer } from './AnimationRenderer'
import { SimulationRenderer } from './SimulationRenderer'
import { Model3DRenderer } from './Model3DRenderer'
import { ConceptMapRenderer } from './ConceptMapRenderer'
import { cn } from '@/lib/utils'

export function ContentDisplay() {
  const currentContent = useCurrentContent()
  const isGenerating = useIsGenerating()
  const error = useError()
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Generation Failed</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )
    }
    
    if (isGenerating) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Visual Explanation</h3>
            <p className="text-sm text-gray-600">Creating your personalized learning content...</p>
          </div>
        </div>
      )
    }
    
    if (!currentContent) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Learn</h3>
            <p className="text-sm text-gray-600">Ask a question to get started with your visual explanation</p>
          </div>
        </div>
      )
    }
    
    // Render content based on modality
    switch (currentContent.modality) {
      case 'animation':
        return <AnimationRenderer data={currentContent.data as any} metadata={currentContent.metadata} />
      
      case 'simulation':
        return <SimulationRenderer data={currentContent.data as any} metadata={currentContent.metadata} />
      
      case '3d':
        return <Model3DRenderer data={currentContent.data as any} metadata={currentContent.metadata} />
      
      case 'concept-map':
        return <ConceptMapRenderer data={currentContent.data as any} metadata={currentContent.metadata} />
      
      case 'diagram':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Diagram View</h3>
              <p className="text-sm text-gray-600">Static diagram visualization</p>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="text-gray-800 leading-relaxed">
                {(currentContent.data as any).content}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Type Not Supported</h3>
              <p className="text-sm text-gray-600">
                Modality &quot;{currentContent.modality}&quot; is not yet implemented
              </p>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="learning-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Visual Explanation
        </h2>
        {currentContent && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              "bg-primary-100 text-primary-800"
            )}>
              {currentContent.modality}
            </span>
            <span>Difficulty: {currentContent.metadata.difficulty}/10</span>
            <span>Duration: {Math.ceil(currentContent.metadata.estimatedDuration / 60)}min</span>
          </div>
        )}
      </div>
      
      <div className="canvas-container">
        {renderContent()}
      </div>
      
      {currentContent && currentContent.metadata.tags.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Related Topics:</div>
          <div className="flex flex-wrap gap-2">
            {currentContent.metadata.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}