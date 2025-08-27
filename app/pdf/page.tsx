'use client'

import React, { useState } from 'react'
import { PDFUploader } from '@/components/pdf/PDFUploader'
import { Search, FileText, Brain, Database, CheckCircle } from 'lucide-react'

interface UploadResult {
  filename: string
  status: 'success' | 'error'
  message: string
  data?: {
    pdfId: string
    sourceId: string
    sections: number
    trainingData: number
    complianceIssues: number
    pages: number
    images: number
  }
}

interface TestResult {
  query: string
  results: any[]
  count: number
  attribution: string
}

export default function PDFProcessingPage() {
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadResults(results)
    const successfulUploads = results.filter(r => r.status === 'success').length
    
    if (successfulUploads > 0) {
      setShowTestPanel(true)
    }
  }

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return

    setIsSearching(true)
    setTestResults(null)

    try {
      const response = await fetch(
        `/api/pdf/upload?query=${encodeURIComponent(testQuery)}&limit=5`
      )
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setTestResults(data)

    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const totalTrainingData = uploadResults.reduce((sum, result) => 
    sum + (result.data?.trainingData || 0), 0
  )

  const totalSections = uploadResults.reduce((sum, result) => 
    sum + (result.data?.sections || 0), 0
  )

  const totalPages = uploadResults.reduce((sum, result) => 
    sum + (result.data?.pages || 0), 0
  )

  const sampleQueries = [
    "How to install a toilet flange?",
    "What size pipe for kitchen sink drain?",
    "How to fix a leaking P-trap?",
    "Installation steps for PEX pipe?",
    "Safety requirements for gas pipe installation"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">TradeAI Tutor</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                PDF Processing
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Training Data Generated: {totalTrainingData}</span>
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

      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalPages}</div>
            <div className="text-sm text-gray-600">Pages Processed</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalSections}</div>
            <div className="text-sm text-gray-600">Sections Extracted</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalTrainingData}</div>
            <div className="text-sm text-gray-600">Training Items</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {uploadResults.filter(r => r.status === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Files Ready</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PDF Upload Panel */}
          <div className="xl:col-span-2">
            <PDFUploader onUploadComplete={handleUploadComplete} />
          </div>

          {/* Test Panel */}
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🚀 Quick Start Guide
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                  <span>Select your plumbing PDFs using drag & drop or file browser</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                  <span>Choose the content category (Manufacturer, Code, etc.)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                  <span>Click "Process PDFs" and watch the AI extract training data</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                  <span>Test the knowledge base with sample questions below</span>
                </div>
              </div>
            </div>

            {/* Test Search */}
            {(showTestPanel || uploadResults.length > 0) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🧠 Test Knowledge Base
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ask a plumbing question:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        placeholder="e.g., How to install a toilet flange?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleTestQuery()}
                      />
                      <button
                        onClick={handleTestQuery}
                        disabled={isSearching || !testQuery.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sample Questions */}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Try these questions:</div>
                    <div className="flex flex-wrap gap-2">
                      {sampleQueries.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => setTestQuery(query)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {testResults && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Search Results ({testResults.count} found)
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {testResults.results.slice(0, 3).map((result, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Q: {result.question}
                          </div>
                          <div className="text-xs text-gray-700 mb-2">
                            A: {result.answer.substring(0, 150)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            Source: {result.context.source} • {result.context.category}
                            {result.context.manufacturer && ` • ${result.context.manufacturer}`}
                          </div>
                        </div>
                      ))}
                    </div>

                    {testResults.attribution && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Attribution:</strong> {testResults.attribution}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* System Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ System Features
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Automatic text & image extraction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Step-by-step procedure parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI training data generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Legal compliance checking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Semantic search capabilities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Attribution & source tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t pt-8 text-center text-gray-600">
          <p className="mb-2">TradeAI Tutor - PDF Processing & Training System</p>
          <p className="text-sm">
            Upload your plumbing manuals and technical documentation to enhance the AI training data
          </p>
        </footer>
      </div>
    </div>
  )
}