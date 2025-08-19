'use client'

import { useState, useEffect, useRef } from 'react'
import { LearningEngine } from '@/core/LearningEngine'
import { VoiceEngine } from '@/intelligence/VoiceEngine'
import { PrerequisiteEngine } from '@/intelligence/PrerequisiteEngine'

interface DemoStep {
  id: string
  title: string
  description: string
  concept: string
  expectedModality: string
  duration: number
  showAdaptation?: boolean
  forceFail?: boolean
}

interface DemoState {
  currentStep: number
  isRunning: boolean
  showingAdaptation: boolean
  userId: string
  results: any[]
  analytics: any
  totalDuration: number
  startTime: number
}

export default function DemoMode() {
  const [demoState, setDemoState] = useState<DemoState>({
    currentStep: 0,
    isRunning: false,
    showingAdaptation: false,
    userId: 'yc_demo_user',
    results: [],
    analytics: null,
    totalDuration: 0,
    startTime: 0
  })
  
  const [currentContent, setCurrentContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showPrerequisites, setShowPrerequisites] = useState(false)
  
  const engineRef = useRef<LearningEngine | null>(null)
  const voiceRef = useRef<VoiceEngine | null>(null)
  const prereqRef = useRef<PrerequisiteEngine | null>(null)
  
  useEffect(() => {
    engineRef.current = new LearningEngine()
    voiceRef.current = new VoiceEngine()
    prereqRef.current = new PrerequisiteEngine()
  }, [])

  const demoSteps: DemoStep[] = [
    {
      id: 'crispr_intro',
      title: 'CRISPR Gene Editing',
      description: 'User asks about CRISPR. System detects missing prerequisites.',
      concept: 'How does CRISPR gene editing work?',
      expectedModality: 'animation',
      duration: 20,
      showAdaptation: false
    },
    {
      id: 'crispr_adaptation',
      title: 'Adaptation in Action',
      description: 'User struggles with animation. System switches to interactive.',
      concept: 'CRISPR gene editing mechanism',
      expectedModality: 'simulation',
      duration: 25,
      showAdaptation: true,
      forceFail: true
    },
    {
      id: 'recursion_learned',
      title: 'Personalized Start',
      description: 'System learned user prefers interactive. Starts with simulation.',
      concept: 'How does recursion work in programming?',
      expectedModality: 'simulation',
      duration: 20,
      showAdaptation: false
    }
  ]

  const startDemo = async () => {
    console.log('🎬 Starting YC Demo Mode')
    
    setDemoState(prev => ({
      ...prev,
      isRunning: true,
      currentStep: 0,
      startTime: Date.now(),
      results: []
    }))
    
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(
        'Welcome to ClearLearn. Watch how our system adapts to create the perfect learning experience for each individual.',
        'instruction'
      )
    }
    
    // Start with first step
    await executeStep(0)
  }

  const executeStep = async (stepIndex: number) => {
    if (stepIndex >= demoSteps.length) {
      await finishDemo()
      return
    }
    
    const step = demoSteps[stepIndex]
    setIsLoading(true)
    
    console.log(`🎯 Executing demo step ${stepIndex + 1}: ${step.title}`)
    
    // Update current step
    setDemoState(prev => ({ ...prev, currentStep: stepIndex }))
    
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(step.description, 'instruction')
    }
    
    try {
      // Special handling for prerequisite detection
      if (step.id === 'crispr_intro') {
        await handlePrerequisiteDemo(step)
      } else if (step.showAdaptation) {
        await handleAdaptationDemo(step)
      } else {
        await handleNormalStep(step)
      }
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, step.duration * 1000))
      
      // Move to next step
      await executeStep(stepIndex + 1)
      
    } catch (error) {
      console.error('Demo step failed:', error)
      setIsLoading(false)
    }
  }

  const handlePrerequisiteDemo = async (step: DemoStep) => {
    // Check prerequisites for CRISPR
    if (prereqRef.current) {
      const prereqCheck = prereqRef.current.checkPrerequisites(
        'crispr gene editing',
        demoState.userId
      )
      
      if (!prereqCheck.canProceedDirectly) {
        setShowPrerequisites(true)
        
        if (voiceEnabled && voiceRef.current) {
          await voiceRef.current.speakText(
            `I notice you might need some background knowledge first. Let me offer quick primers on ${prereqCheck.missingConcepts.map(c => c.concept).join(' and ')}.`,
            'prompt'
          )
        }
        
        // Show prerequisite offering for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000))
        setShowPrerequisites(false)
      }
    }
    
    // Generate content anyway
    const content = await engineRef.current!.processQuery(step.concept, demoState.userId)
    setCurrentContent(content)
    
    setDemoState(prev => ({
      ...prev,
      results: [...prev.results, { step: step.id, content, adaptation: false }]
    }))
    
    setIsLoading(false)
  }

  const handleAdaptationDemo = async (step: DemoStep) => {
    // First, simulate user struggling with current content
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(
        'The user seems confused by the animation. Let me try a different approach.',
        'feedback'
      )
    }
    
    setDemoState(prev => ({ ...prev, showingAdaptation: true }))
    
    // Record negative feedback to trigger adaptation
    engineRef.current!.recordFeedback({
      contentId: 'demo_content_1',
      understood: false,
      rating: 2,
      comments: 'Too abstract, need more interaction',
      timestamp: new Date()
    }, demoState.userId, 'animation')
    
    // Get alternative modality suggestion
    const suggestion = await engineRef.current!.suggestAlternativeModality(
      demoState.userId,
      'animation',
      'CRISPR gene editing'
    )
    
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(
        `Based on your learning style, I recommend trying ${suggestion.modality} instead. ${suggestion.reasoning}`,
        'instruction'
      )
    }
    
    // Generate content with suggested modality
    const content = await engineRef.current!.generateProgressiveContent(
      'CRISPR gene editing',
      suggestion.modality as any,
      1,
      demoState.userId
    )
    
    setCurrentContent(content)
    
    setDemoState(prev => ({
      ...prev,
      results: [...prev.results, { step: step.id, content, adaptation: true, suggestion }],
      showingAdaptation: false
    }))
    
    setIsLoading(false)
  }

  const handleNormalStep = async (step: DemoStep) => {
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(
        'Notice how the system now starts with the interactive approach, having learned from the previous interaction.',
        'instruction'
      )
    }
    
    // Generate content (system should now prefer interactive based on learning)
    const content = await engineRef.current!.processQuery(step.concept, demoState.userId)
    setCurrentContent(content)
    
    setDemoState(prev => ({
      ...prev,
      results: [...prev.results, { step: step.id, content, adaptation: false }]
    }))
    
    setIsLoading(false)
  }

  const finishDemo = async () => {
    console.log('🎉 Demo completed')
    
    // Get final analytics
    const analytics = engineRef.current!.getUserAnalytics(demoState.userId)
    setDemoState(prev => ({
      ...prev,
      analytics,
      isRunning: false,
      totalDuration: Date.now() - prev.startTime
    }))
    
    if (voiceEnabled && voiceRef.current) {
      await voiceRef.current.speakText(
        'Demo complete! The system has learned this user prefers interactive content and will adapt all future explanations accordingly.',
        'instruction'
      )
    }
  }

  const resetDemo = () => {
    setDemoState({
      currentStep: 0,
      isRunning: false,
      showingAdaptation: false,
      userId: 'yc_demo_user_' + Date.now(),
      results: [],
      analytics: null,
      totalDuration: 0,
      startTime: 0
    })
    setCurrentContent(null)
    setShowPrerequisites(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 ClearLearn YC Demo
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Adaptive Visual Learning System - Personalized Education at Scale
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={demoState.isRunning ? resetDemo : startDemo}
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition-colors ${
                demoState.isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {demoState.isRunning ? '🔄 Reset Demo' : '▶️ Start 2-Minute Demo'}
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">🎤 Voice Narration</span>
            </label>
          </div>
        </div>

        {/* Demo Progress */}
        {demoState.isRunning && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Demo Progress</h2>
              <div className="text-sm text-gray-500">
                Step {demoState.currentStep + 1} of {demoSteps.length}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    index === demoState.currentStep
                      ? 'border-blue-500 bg-blue-50'
                      : index < demoState.currentStep
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                  {index === demoState.currentStep && isLoading && (
                    <div className="mt-2 flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Processing...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites Modal */}
        {showPrerequisites && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">🎯 Prerequisites Detected</h3>
              <p className="text-gray-600 mb-4">
                I notice you might benefit from understanding these concepts first:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>DNA Structure (2 min primer)</li>
                <li>Protein Synthesis (3 min primer)</li>
              </ul>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  📚 Quick Primer
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  🚀 Continue Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Content Display */}
        {currentContent && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{currentContent.metadata.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentContent.modality === 'animation' ? 'bg-blue-100 text-blue-800' :
                  currentContent.modality === 'simulation' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {currentContent.modality}
                </span>
                {demoState.showingAdaptation && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    🔄 Adapting
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">
                {currentContent.modality === 'animation' ? '🎬' :
                 currentContent.modality === 'simulation' ? '🎮' :
                 currentContent.modality === '3d' ? '🎲' : '🗺️'}
              </div>
              <p className="text-gray-600 text-lg">
                {currentContent.metadata.description}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Difficulty: {currentContent.metadata.difficulty}/10 • 
                Duration: {currentContent.metadata.estimatedDuration}s
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {demoState.analytics && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">📊 Learning Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {demoState.analytics.progress.preferredModality}
                </div>
                <div className="text-sm text-blue-700">Preferred Modality</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {demoState.analytics.adaptationEvents.length}
                </div>
                <div className="text-sm text-green-700">Adaptations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(demoState.totalDuration / 1000)}s
                </div>
                <div className="text-sm text-purple-700">Demo Duration</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {demoState.analytics.progress.learningSpeed}
                </div>
                <div className="text-sm text-orange-700">Learning Speed</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Innovation Highlights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🎯 Innovation Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold mb-2">True Personalization</h4>
              <p className="text-sm text-gray-600">
                Bayesian learning adapts to each user&apos;s unique learning style in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">Instant Adaptation</h4>
              <p className="text-sm text-gray-600">
                Detects confusion in 45 seconds and automatically switches modalities
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Prerequisite Intelligence</h4>
              <p className="text-sm text-gray-600">
                Automatically detects missing background knowledge and offers just-in-time primers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}