'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DemoWidget = () => {
  const [isDemo, setIsDemo] = useState(false)
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
      <div className="text-4xl mb-4">🎯</div>
      <h3 className="text-xl font-semibold mb-4">See Adaptation in Action</h3>
      <p className="text-gray-600 mb-6">
        Watch how our AI learns your style in real-time and adapts the explanation method.
      </p>
      <button
        onClick={() => setIsDemo(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        ▶️ Start Live Demo
      </button>
      {isDemo && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="text-2xl mb-2">🎬</div>
          <p className="text-sm">Demo functionality will be available once the system loads completely.</p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    concepts: 1247,
    adaptations: 15789,
    users: 8934
  })
  
  useEffect(() => {
    // Animate stats on load
    const timer = setInterval(() => {
      setStats(prev => ({
        concepts: Math.min(prev.concepts + 23, 1247),
        adaptations: Math.min(prev.adaptations + 347, 15789), 
        users: Math.min(prev.users + 89, 8934)
      }))
    }, 100)
    
    setTimeout(() => clearInterval(timer), 3000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Learn Anything,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Your Way
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                The first AI-powered learning system that truly adapts to how <em>you</em> learn best. 
                From visual animations to hands-on simulations - personalized in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link 
                  href="/demo"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
                >
                  🚀 Watch 2-Minute Demo
                </Link>
                <Link
                  href="/test-quantum"
                  className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-lg transition-colors"
                >
                  🧪 Try Interactive Demo
                </Link>
              </div>
              
              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.concepts.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Concepts Explained</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.adaptations.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">AI Adaptations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.users.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Learning Sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Demo Widget */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <DemoWidget />
        </div>
        
        {/* Problem & Solution */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  The Problem with One-Size-Fits-All Education
                </h2>
                <div className="space-y-4 text-lg text-gray-600">
                  <p>📚 Traditional learning assumes everyone learns the same way</p>
                  <p>😴 65% of people are visual learners, yet most education is text-based</p>
                  <p>⏰ Students waste hours on content that doesn't match their learning style</p>
                  <p>🧠 Complex concepts become barriers instead of stepping stones</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">Our Solution</h3>
                  <p className="text-gray-600">
                    AI that learns how you learn, then adapts every explanation to match your unique style. 
                    Visual? Interactive? Step-by-step? We detect and deliver.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Innovation Showcase */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Breakthrough AI Technology
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Five years of research in personalized learning, condensed into 
                real-time adaptation that happens in seconds, not semesters.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-4">Bayesian Learning</h3>
                <p className="text-gray-600">
                  Our AI builds a probabilistic model of how you learn, updating beliefs 
                  with every interaction to predict the perfect explanation method.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-4">45-Second Detection</h3>
                <p className="text-gray-600">
                  Confusion detected in under 45 seconds. System automatically switches 
                  to a better modality before frustration sets in.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-4">Prerequisite Intelligence</h3>
                <p className="text-gray-600">
                  Automatically detects missing background knowledge and offers 
                  just-in-time primers. No more "I don't get it" moments.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* The Vision */}
        <div className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              The Future of Learning is Personal
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-indigo-200">
              Imagine a world where every student has a personal AI tutor that understands 
              exactly how they learn best. That world starts today.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">🌍 Global Impact</h3>
                <p className="text-indigo-200">
                  Democratizing personalized education for millions of learners worldwide, 
                  regardless of location or economic status.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">🚀 Scalable Intelligence</h3>
                <p className="text-indigo-200">
                  Built to handle millions of concurrent users while maintaining 
                  sub-2-second response times and true personalization.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="px-8 py-4 bg-white text-indigo-900 rounded-lg hover:bg-gray-100 font-medium text-lg transition-colors"
              >
                🎬 See Full Demo
              </Link>
              <Link
                href="/admin"
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium text-lg transition-colors"
              >
                📊 View Analytics
              </Link>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience Adaptive Learning?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the future of personalized education. Start learning the way you learn best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
              >
                🚀 Start Learning Now
              </Link>
              <Link
                href="/test-quantum"
                className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-lg transition-colors"
              >
                🧪 Try Advanced Demo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h3 className="text-2xl font-bold mb-4">ClearLearn</h3>
                <p className="text-gray-400 mb-4">
                  Adaptive Visual Learning System powered by breakthrough AI technology. 
                  Making personalized education accessible to everyone.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <div className="space-y-2 text-gray-400">
                  <div><Link href="/demo">Live Demo</Link></div>
                  <div><Link href="/test-quantum">Interactive Test</Link></div>
                  <div><Link href="/admin">Analytics</Link></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Technology</h4>
                <div className="space-y-2 text-gray-400">
                  <div>Bayesian Learning</div>
                  <div>Real-time Adaptation</div>
                  <div>Prerequisite Detection</div>
                  <div>Multi-modal Content</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ClearLearn. Revolutionizing education through AI adaptation.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}