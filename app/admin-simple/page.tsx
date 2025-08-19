'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SimpleAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'modalities'>('overview')

  const systemStats = {
    totalUsers: 1247,
    totalSessions: 8934,
    modalityDistribution: {
      'animation': 2847,
      'simulation': 2156,
      'concept-map': 1823,
      '3d': 1234,
      'diagram': 756,
      'text': 118
    },
    averageSessionDuration: 287,
    conceptsMastered: 15789
  }

  const userAnalytics = {
    progress: {
      preferredModality: 'simulation',
      learningSpeed: 'fast',
      sessionsCompleted: 23,
      conceptsLearned: ['photosynthesis', 'dna structure', 'recursion']
    },
    beliefs: {
      modalityPreferences: {
        'animation': 0.15,
        'simulation': 0.35,
        'concept-map': 0.25,
        '3d': 0.15,
        'diagram': 0.07,
        'text': 0.03
      }
    },
    patterns: {
      patterns: [
        {
          pattern: 'Prefers interactive content',
          confidence: 0.87,
          recommendation: 'Continue using simulations as primary modality'
        },
        {
          pattern: 'Fast learner',
          confidence: 0.92,
          recommendation: 'Can handle higher complexity levels'
        }
      ]
    }
  }

  const getModalityColor = (modality: string): string => {
    const colors = {
      'animation': '#3b82f6',
      'simulation': '#10b981',
      'concept-map': '#f59e0b',
      '3d': '#8b5cf6',
      'diagram': '#ef4444',
      'text': '#6b7280'
    }
    return colors[modality as keyof typeof colors] || '#6b7280'
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Learning Analytics Dashboard</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🏠 Home
          </Link>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'System Overview' },
              { id: 'user', label: 'User Analytics' },
              { id: 'modalities', label: 'Modality Performance' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalSessions.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Avg Session Duration</h3>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(systemStats.averageSessionDuration)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Concepts Mastered</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.conceptsMastered.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold">Intelligence Layer</div>
                  <div className="text-sm text-green-700">✅ Active</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold">Content Cache</div>
                  <div className="text-sm text-blue-700">✅ 87% Hit Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-semibold">API Fallback</div>
                  <div className="text-sm text-purple-700">✅ 3 Providers</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 font-semibold">Response Time</div>
                  <div className="text-sm text-orange-700">✅ 1.2s avg</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Progress */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sessions Completed</span>
                    <span className="font-medium">{userAnalytics.progress.sessionsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Concepts Learned</span>
                    <span className="font-medium">{userAnalytics.progress.conceptsLearned.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Modality</span>
                    <span className="font-medium capitalize">{userAnalytics.progress.preferredModality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Learning Speed</span>
                    <span className="font-medium capitalize">{userAnalytics.progress.learningSpeed}</span>
                  </div>
                </div>
              </div>

              {/* Bayesian Beliefs */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modality Preferences</h3>
                <div className="space-y-2">
                  {Object.entries(userAnalytics.beliefs.modalityPreferences)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([modality, preference]) => (
                      <div key={modality} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{modality}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(preference as number) * 100}%`,
                                backgroundColor: getModalityColor(modality)
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">
                            {((preference as number) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Learning Patterns */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Patterns</h3>
              <div className="space-y-4">
                {userAnalytics.patterns.patterns.map((pattern: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-gray-900">{pattern.pattern}</p>
                    <p className="text-sm text-gray-600 mt-1">{pattern.recommendation}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="h-1 bg-green-500 rounded-full"
                          style={{ width: `${pattern.confidence * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {(pattern.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modality Performance Tab */}
        {activeTab === 'modalities' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Distribution</h3>
            <div className="space-y-3">
              {Object.entries(systemStats.modalityDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([modality, count]) => {
                  const total = Object.values(systemStats.modalityDistribution).reduce((a, b) => a + b, 0)
                  const percentage = (count / total) * 100
                  return (
                    <div key={modality} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{modality}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getModalityColor(modality)
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-400 w-16">
                          ({count.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <Link 
              href="/demo-simple"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🎬 View Demo
            </Link>
            <Link 
              href="/test-simple"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🧪 Test Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}