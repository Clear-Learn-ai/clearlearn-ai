'use client'

import { useState, useRef, useEffect } from 'react'
import { useGenerateContent, useSetQuery, useCurrentQuery, useIsGenerating } from '@/lib/store'
import { cn } from '@/lib/utils'

const SUGGESTED_QUERIES = [
  'How does photosynthesis work?',
  'How does gravity work?',
  'Structure of DNA',
  'How do neural networks learn?',
  'Water cycle',
  'How does the internet work?',
  'Explain cellular respiration',
  'What is DNA replication?',
  'How do vaccines work?',
  'How does the heart pump blood?',
  'Ecosystem food chains',
  'What is democracy?'
]

export function QueryInput() {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  
  const currentQuery = useCurrentQuery()
  const isGenerating = useIsGenerating()
  const generateContent = useGenerateContent()
  const setQuery = useSetQuery()
  
  useEffect(() => {
    if (inputValue.length > 2) {
      const filtered = SUGGESTED_QUERIES.filter(query =>
        query.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [inputValue])
  
  const handleSubmit = async (query: string = inputValue) => {
    if (!query.trim() || isGenerating) return
    
    setQuery(query.trim())
    setInputValue('')
    setShowSuggestions(false)
    
    try {
      await generateContent(query.trim())
    } catch (error) {
      console.error('Failed to generate content:', error)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    handleSubmit(suggestion)
  }
  
  return (
    <div className="learning-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Ask About Any Concept
        </h2>
        <p className="text-sm text-gray-600">
          Enter a question and we&apos;ll create a visual explanation
        </p>
      </div>
      
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
            placeholder="e.g., How does photosynthesis work?"
            disabled={isGenerating}
            className={cn(
              "w-full px-4 py-3 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          
          <button
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isGenerating}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "px-4 py-1.5 rounded-md text-sm font-medium",
              "bg-primary-600 text-white",
              "hover:bg-primary-700 disabled:bg-gray-300",
              "disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              'Ask'
            )}
          </button>
        </div>
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="text-sm text-gray-900">{suggestion}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Current Query Display */}
      {currentQuery && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="text-sm text-primary-600 font-medium">Current Query:</div>
          <div className="text-sm text-primary-800">{currentQuery}</div>
        </div>
      )}
      
      {/* Quick Suggestions */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 mb-3">Try these popular topics:</div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.slice(0, 3).map((query, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(query)}
              disabled={isGenerating}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border",
                "bg-gray-50 border-gray-200 text-gray-700",
                "hover:bg-gray-100 hover:border-gray-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}