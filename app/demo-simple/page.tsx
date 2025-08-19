'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SimpleDemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const demoSteps = [
    {
      title: "CRISPR Gene Editing",
      description: "User asks about CRISPR. System starts with animation.",
      modality: "animation",
      icon: "🎬"
    },
    {
      title: "Adaptation Detected",
      description: "User struggles. System switches to interactive simulation.",
      modality: "simulation", 
      icon: "🎮"
    },
    {
      title: "Learning Applied",
      description: "For recursion, system now starts with interactive approach.",
      modality: "simulation",
      icon: "🧠"
    }
  ]

  const startDemo = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    
    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 ClearLearn YC Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Adaptive Visual Learning System - Watch Real-Time Personalization
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={isRunning ? () => setIsRunning(false) : startDemo}
              className={`px-8 py-3 rounded-lg font-semibold text-white text-lg ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? '⏹️ Stop Demo' : '▶️ Start 2-Minute Demo'}
            </button>
            
            <Link 
              href="/"
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-lg"
            >
              🏠 Home
            </Link>
          </div>
        </div>

        {/* Demo Progress */}
        {isRunning && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Demo Progress</h2>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {demoSteps.length}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                    index === currentStep
                      ? 'border-blue-500 bg-blue-50 scale-105'
                      : index < currentStep
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <div className="font-medium text-sm mb-1">{step.title}</div>
                    <div className="text-xs text-gray-600">{step.description}</div>
                    <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                      step.modality === 'animation' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {step.modality}
                    </div>
                  </div>
                  
                  {index === currentStep && (
                    <div className="mt-3 flex justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Content Simulation */}
        {isRunning && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center">
              <div className="text-8xl mb-4">{demoSteps[currentStep].icon}</div>
              <h3 className="text-2xl font-bold mb-2">{demoSteps[currentStep].title}</h3>
              <p className="text-gray-600 mb-4">{demoSteps[currentStep].description}</p>
              
              <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700">Adapting to learning style...</span>
              </div>
            </div>
          </div>
        )}

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="font-bold mb-2">Bayesian Learning</h3>
              <p className="text-sm text-gray-600">
                AI builds probabilistic model of how you learn, updating with every interaction
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">45-Second Detection</h3>
              <p className="text-sm text-gray-600">
                System detects confusion and switches modalities before frustration sets in
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Prerequisite Intelligence</h3>
              <p className="text-sm text-gray-600">
                Automatically detects missing knowledge and offers just-in-time primers
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">📊 Learning Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Interactive</div>
              <div className="text-sm text-blue-700">Preferred Modality</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-green-700">Adaptations Made</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Fast</div>
              <div className="text-sm text-purple-700">Learning Speed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">87%</div>
              <div className="text-sm text-orange-700">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <Link 
              href="/test-simple"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🧪 Test Simple Page
            </Link>
            <Link 
              href="/admin"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              📊 Analytics Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}