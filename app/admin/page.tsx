'use client'

import { useState, useEffect } from 'react'
import { LearningEngine } from '@/core/LearningEngine'

interface UserAnalytics {
  progress: any
  patterns: any
  beliefs: any
  adaptationEvents: any[]
  recommendations: any[]
}

interface SystemStats {
  totalUsers: number
  totalSessions: number
  modalityDistribution: Record<string, number>
  averageSessionDuration: number
  conceptsMastered: number
}

export default function AdminDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string>('user_demo_123')
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'modalities' | 'adaptation'>('overview')
  const [loading, setLoading] = useState(false)
  
  const engine = new LearningEngine()

  const loadUserAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate some user interactions first for demo purposes
      await simulateUserInteractions()
      
      const analytics = engine.getUserAnalytics(selectedUserId)
      setUserAnalytics(analytics)
      
      // Mock system stats
      setSystemStats({
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
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
    setLoading(false)
  }

  const simulateUserInteractions = async () => {
    // Simulate some user interactions for demo
    const interactions = [
      {
        userId: selectedUserId,
        sessionId: 'demo_session_1',
        contentId: 'photosynthesis_content_1',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        action: { type: 'view' as const },
        timeSpent: 45,
        modality: 'animation' as const,
        understood: true,
        switchedModality: false,
        depth: 1
      },
      {
        userId: selectedUserId,
        sessionId: 'demo_session_2',
        contentId: 'quantum_entanglement_content_1',
        timestamp: new Date(Date.now() - 1800000), // 30 min ago
        action: { type: 'view' as const },
        timeSpent: 120,
        modality: 'concept-map' as const,
        understood: false,
        switchedModality: true,
        depth: 2
      },
      {
        userId: selectedUserId,
        sessionId: 'demo_session_2',
        contentId: 'quantum_entanglement_content_2',
        timestamp: new Date(Date.now() - 1200000), // 20 min ago
        action: { type: 'view' as const },
        timeSpent: 90,
        modality: 'simulation' as const,
        understood: true,
        switchedModality: false,
        depth: 2
      }
    ]

    // Record interactions through the adaptive engine
    interactions.forEach(interaction => {
      // @ts-ignore - accessing private method for demo
      engine.adaptiveEngine?.recordUserInteraction(interaction)
    })
  }

  useEffect(() => {
    loadUserAnalytics()
  }, [selectedUserId])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Learning Analytics Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'System Overview' },
              { id: 'user', label: 'User Analytics' },
              { id: 'modalities', label: 'Modality Performance' },
              { id: 'adaptation', label: 'Adaptation Events' }
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

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* System Overview Tab */}
            {activeTab === 'overview' && systemStats && (
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
            )}

            {/* User Analytics Tab */}
            {activeTab === 'user' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">User Selection</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Enter user ID"
                      />
                      <button
                        onClick={loadUserAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        Load Analytics
                      </button>
                    </div>
                  </div>
                </div>

                {userAnalytics && (
                  <>
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
                                        width: `${(preference as number) * 500}%`, // Multiply by 500 for visibility
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
                  </>
                )}
              </div>
            )}

            {/* Modality Performance Tab */}
            {activeTab === 'modalities' && systemStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {userAnalytics && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Success Rates</h3>
                    <div className="space-y-3">
                      {Object.entries(userAnalytics.progress.modalitySuccessRates)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([modality, rate]) => (
                          <div key={modality} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{modality}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${(rate as number) * 100}%`,
                                    backgroundColor: getModalityColor(modality)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10">
                                {((rate as number) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Adaptation Events Tab */}
            {activeTab === 'adaptation' && userAnalytics && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Adaptation Events</h3>
                {userAnalytics.adaptationEvents.length > 0 ? (
                  <div className="space-y-4">
                    {userAnalytics.adaptationEvents.slice(-10).reverse().map((event: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {event.trigger.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{event.fromModality}</span>
                          <span>→</span>
                          <span className="capitalize">{event.toModality}</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            event.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.successful ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Concept: {event.concept}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No adaptation events recorded yet</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}