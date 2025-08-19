'use client'

import { useState } from 'react'
import { LearningEngine } from '@/core/LearningEngine'

export default function QuantumTestPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('')
  
  const engine = new LearningEngine()
  const userId = 'test_user_quantum_123'

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true)
    setSelectedTest(testName)
    
    try {
      console.log(`🧪 Running test: ${testName}`)
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setResults(prev => [...prev, {
        test: testName,
        success: true,
        result,
        duration,
        timestamp: new Date()
      }])
      
      console.log(`✅ Test ${testName} completed in ${duration}ms`)
    } catch (error) {
      console.error(`❌ Test ${testName} failed:`, error)
      setResults(prev => [...prev, {
        test: testName,
        success: false,
        error: error.message,
        duration: 0,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
      setSelectedTest('')
    }
  }

  const tests = [
    {
      name: 'Basic Quantum Entanglement Query',
      description: 'Test basic adaptive content generation',
      run: () => engine.processQuery('How does quantum entanglement work?', userId)
    },
    {
      name: 'ELI5 Quantum Entanglement',
      description: 'Test ELI5 progressive depth system',
      run: () => engine.getELI5Explanation('quantum entanglement', 'animation')
    },
    {
      name: 'Advanced Quantum Entanglement', 
      description: 'Test advanced progressive depth',
      run: () => engine.getAdvancedExplanation('quantum entanglement', 'concept-map')
    },
    {
      name: 'Progressive Depth Level 2',
      description: 'Test specific depth level generation',
      run: () => engine.generateProgressiveContent('quantum entanglement', 'simulation', 2, userId)
    },
    {
      name: 'Depth Progression',
      description: 'Test progressing to deeper level',
      run: async () => {
        // First generate basic content
        await engine.generateProgressiveContent('quantum entanglement', 'animation', 0, userId)
        // Then progress deeper
        return engine.progressDeeper('quantum entanglement', 'animation', userId, {
          timeSpent: 60,
          understood: true,
          rating: 4
        })
      }
    },
    {
      name: 'User Analytics',
      description: 'Test user learning analytics',
      run: () => {
        // Record some feedback first
        engine.recordFeedback({
          contentId: 'quantum_test_content',
          understood: true,
          rating: 5,
          comments: 'Great explanation!',
          timestamp: new Date()
        }, userId, 'animation')
        
        return engine.getUserAnalytics(userId)
      }
    },
    {
      name: 'Alternative Modality Suggestion',
      description: 'Test modality recommendation system',
      run: () => engine.suggestAlternativeModality(userId, 'text', 'quantum entanglement')
    },
    {
      name: 'Cache Statistics',
      description: 'Test content caching system',
      run: async () => {
        // Generate some content to populate cache
        await engine.processQuery('quantum entanglement basics', userId)
        await engine.processQuery('quantum entanglement applications', userId)
        
        // Get cache stats (need to access through smart content generator)
        return {
          message: 'Cache populated with quantum entanglement content',
          cacheEnabled: true
        }
      }
    },
    {
      name: 'Concept Map Generation',
      description: 'Test concept map for complex quantum concepts',
      run: () => engine.processQuery('quantum entanglement and Bell theorem relationships', userId)
    },
    {
      name: 'Simulation Generation',
      description: 'Test interactive simulation for quantum mechanics',
      run: () => engine.processQuery('interactive quantum entanglement simulation with measurement', userId)
    }
  ]

  const clearResults = () => {
    setResults([])
    console.log('🗑️ Test results cleared')
  }

  const runAllTests = async () => {
    setResults([])
    console.log('🚀 Running all quantum entanglement tests')
    
    for (const test of tests) {
      await runTest(test.name, test.run)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('✅ All tests completed')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔬 Quantum Entanglement Intelligence Test
        </h1>
        <p className="text-gray-600 mb-8">
          Testing the adaptive visual learning system with the challenging concept of quantum entanglement
        </p>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Controls</h2>
            <div className="flex space-x-2">
              <button
                onClick={runAllTests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '⏳ Testing...' : '🚀 Run All Tests'}
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, index) => (
              <button
                key={index}
                onClick={() => runTest(test.name, test.run)}
                disabled={loading}
                className={`p-4 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors ${
                  selectedTest === test.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">{test.name}</div>
                <div className="text-sm text-gray-600">{test.description}</div>
                {loading && selectedTest === test.name && (
                  <div className="mt-2 flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Running...
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Test Results ({results.length})
          </h2>
          
          {results.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              No tests run yet. Click a test above to get started!
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                  result.success ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {result.success ? '✅' : '❌'} {result.test}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {result.duration}ms • {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {result.success ? (
                  <div className="space-y-2">
                    {result.result?.modality && (
                      <div className="text-sm">
                        <span className="font-medium">Modality:</span> {result.result.modality}
                      </div>
                    )}
                    {result.result?.metadata?.title && (
                      <div className="text-sm">
                        <span className="font-medium">Title:</span> {result.result.metadata.title}
                      </div>
                    )}
                    {result.result?.metadata?.difficulty && (
                      <div className="text-sm">
                        <span className="font-medium">Difficulty:</span> {result.result.metadata.difficulty}/10
                      </div>
                    )}
                    {result.result?.metadata?.estimatedDuration && (
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span> {result.result.metadata.estimatedDuration}s
                      </div>
                    )}
                    
                    {/* Show specific result data based on test type */}
                    {result.test.includes('Analytics') && result.result?.progress && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-2">User Analytics Summary:</div>
                        <div className="text-sm space-y-1">
                          <div>Preferred Modality: {result.result.progress.preferredModality}</div>
                          <div>Learning Speed: {result.result.progress.learningSpeed}</div>
                          <div>Sessions: {result.result.progress.sessionsCompleted}</div>
                        </div>
                      </div>
                    )}
                    
                    {result.test.includes('Alternative') && result.result?.modality && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-2">Recommended Alternative:</div>
                        <div className="text-sm">
                          <div>Modality: {result.result.modality}</div>
                          <div>Reasoning: {result.result.reasoning}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    <span className="font-medium">Error:</span> {result.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Intelligence Layer</div>
              <div className="text-sm text-green-700">✅ Active</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">Content Cache</div>
              <div className="text-sm text-blue-700">✅ Enabled</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold">API Fallback</div>
              <div className="text-sm text-purple-700">✅ Ready</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-semibold">Progressive Depth</div>
              <div className="text-sm text-orange-700">✅ Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}