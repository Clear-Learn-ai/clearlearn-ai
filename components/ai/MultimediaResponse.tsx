'use client'

import { useState, useEffect } from 'react'
import { OrchestrationResult, GeneratedMedia, ProgressUpdate } from '@/lib/ai/types'

interface MultimediaResponseProps {
  query: string
  onResult?: (result: OrchestrationResult) => void
}

export function MultimediaResponse({ query, onResult }: MultimediaResponseProps) {
  const [result, setResult] = useState<OrchestrationResult | null>(null)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      generateResponse()
    }
  }, [query])

  const generateResponse = async () => {
    setLoading(true)
    setError(null)
    setProgress(null)
    setResult(null)

    try {
      const response = await fetch('/api/ai/orchestrate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error('Failed to start orchestration')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream available')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'progress') {
                setProgress(data.data)
              } else if (data.type === 'complete') {
                setResult(data.data)
                onResult?.(data.data)
                setLoading(false)
              } else if (data.type === 'error') {
                setError(data.data.message)
                setLoading(false)
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading && progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">Generating Multi-AI Response</h3>
            <span className="text-sm text-blue-700">{progress.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <p className="text-sm text-blue-800">{progress.message}</p>
          {progress.provider && progress.mediaType && (
            <div className="text-xs text-blue-600 mt-1">
              {progress.provider} → {progress.mediaType}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">Generation Error</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={generateResponse}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Multi-AI Response Complete</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Generated Media:</span>
                <span className="font-medium ml-2">{result.media.length}</span>
              </div>
              <div>
                <span className="text-green-700">Total Time:</span>
                <span className="font-medium ml-2">{(result.totalTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <span className="text-orange-700">Warnings:</span>
                <span className="font-medium ml-2">{result.errors.length} provider errors</span>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {result.media.map((media) => (
              <MediaRenderer key={media.id} media={media} />
            ))}
          </div>

          {result.errors.length > 0 && (
            <details className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <summary className="font-medium text-yellow-900 cursor-pointer">
                Provider Errors ({result.errors.length})
              </summary>
              <div className="mt-2 space-y-1">
                {result.errors.map((error, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    <strong>{error.provider}:</strong> {error.error}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

function MediaRenderer({ media }: { media: GeneratedMedia }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium capitalize">{media.type.replace('-', ' ')} Content</h4>
          <p className="text-sm text-gray-600">
            Generated by {media.metadata.provider} in {(media.metadata.generationTime / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {media.metadata.cost && `$${media.metadata.cost.toFixed(4)}`}
          {media.metadata.tokens && ` • ${media.metadata.tokens} tokens`}
        </div>
      </div>

      <div className="media-content">
        {media.type === 'text' && media.data && (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {media.data}
            </div>
          </div>
        )}

        {media.type === 'image' && (media.url || media.data) && (
          <div className="text-center">
            <img 
              src={media.url || media.data} 
              alt="Generated diagram"
              className="max-w-full h-auto rounded border"
            />
          </div>
        )}

        {media.type === 'video' && media.url && (
          <div className="text-center">
            <video 
              src={media.url} 
              controls 
              className="max-w-full h-auto rounded border"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {media.type === 'audio' && media.data && (
          <div className="text-center">
            <audio 
              src={media.data} 
              controls 
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {media.type === '3d-model' && media.url && (
          <div className="text-center p-4 bg-gray-100 rounded">
            <p className="mb-2 text-sm text-gray-600">3D Model Generated</p>
            <a 
              href={media.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View 3D Model
            </a>
          </div>
        )}
      </div>
    </div>
  )
}