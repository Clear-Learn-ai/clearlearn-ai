'use client'

import { useState } from 'react'
import { LearningEngine } from '@/core/LearningEngine'

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  
  const testQueries = [
    'How does gravity work?',
    'Structure of DNA', 
    'How do neural networks learn?',
    'Water cycle',
    'How does the internet work?',
    'How does photosynthesis work?'
  ]
  
  const testQuery = async (query: string) => {
    console.log('Testing query:', query)
    const engine = new LearningEngine()
    
    try {
      const result = await engine.processQuery(query)
      console.log('Result:', result)
      setResults(prev => [...prev, { query, result, success: true }])
    } catch (error) {
      console.error('Error:', error)
      setResults(prev => [...prev, { query, error: error.message, success: false }])
    }
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug - Test New Generators</h1>
      
      <div className="grid gap-4 mb-8">
        {testQueries.map(query => (
          <button
            key={query}
            onClick={() => testQuery(query)}
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-left"
          >
            Test: {query}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <h3 className="font-bold">{result.query}</h3>
            {result.success ? (
              <div>
                <p className="text-green-800">✅ Modality: {result.result.modality}</p>
                <p className="text-sm text-green-700">Title: {result.result.metadata.title}</p>
                <p className="text-sm text-green-700">Duration: {result.result.metadata.estimatedDuration}s</p>
              </div>
            ) : (
              <p className="text-red-800">❌ Error: {result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}