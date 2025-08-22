'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Play, 
  ArrowRight,
  MessageSquare,
  Video,
  Home
} from 'lucide-react'
import { AppleInteractiveHero } from '@/components/apple/AppleInteractiveHero'
import { AppleMagneticCursor } from '@/components/apple/AppleMagneticCursor'
import { AppleSmoothScroll, useAppleScrollAnimation } from '@/components/apple/AppleSmoothScroll'
import { AppleReactiveNavbar } from '@/components/apple/AppleReactiveNavbar'
import { AppleFooter } from '@/components/apple/AppleFooter'

export default function AppleLandingPage() {
  const [demoStep, setDemoStep] = useState(0)
  useAppleScrollAnimation()

  const demoSteps = [
    {
      question: "How does machine learning work?",
      response: "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. It uses algorithms to identify patterns, make predictions, and improve performance over time...",
      videos: [
        {
          title: "Machine Learning Explained",
          thumbnail: "https://img.youtube.com/vi/ukzFI9rgwfU/maxresdefault.jpg",
          duration: "15:24"
        },
        {
          title: "Neural Networks Fundamentals", 
          thumbnail: "https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg",
          duration: "18:42"
        }
      ]
    }
  ]

  return (
    <AppleSmoothScroll>
      <AppleMagneticCursor />
      <div className="min-h-screen bg-gray-50">
        {/* Apple-style Navigation */}
        <AppleReactiveNavbar />
        
        {/* Back to original theme button */}
        <div className="fixed top-20 left-6 z-50">
          <Link
            href="/"
            className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-full text-gray-700 hover:text-gray-900 transition-all shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Original Theme
          </Link>
        </div>

        {/* Interactive Hero Section */}
        <AppleInteractiveHero />

        {/* Product Demo Section */}
        <section className="relative bg-white py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center fade-in">
              <h2 className="text-6xl font-thin mb-12 text-gray-900">See it in action</h2>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl mx-auto bg-black">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-auto"
                  style={{ minHeight: '60vh' }}
                >
                  <source src="/Demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-gray-600 mt-8 text-xl max-w-3xl mx-auto leading-relaxed font-light">
                Experience seamless learning with our intelligently curated content
              </p>
            </div>
          </div>
        </section>

        {/* Try it yourself section */}
        <section className="relative bg-gray-50 py-32">
          <div className="max-w-7xl mx-auto px-6">
            {/* Interactive Demo */}
            <div className="bg-white rounded-3xl p-16 shadow-xl border border-gray-100 fade-in">
              <h3 className="text-5xl font-thin text-center mb-16 text-gray-900">Try it yourself</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                {/* Question Side */}
                <div>
                  <div className="mb-8">
                    <div className="text-xl font-medium text-gray-700 mb-6">Try asking:</div>
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="w-7 h-7 text-gray-600" />
                        <span className="text-gray-800 text-xl font-medium">{demoSteps[0].question}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/apple-theme/chat"
                    className="inline-flex items-center px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-blue-600"
                  >
                    <Play className="w-5 h-5 mr-3" />
                    Try it yourself
                  </Link>
                </div>

                {/* Response Side */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                    <div className="text-xl font-medium text-gray-800 mb-6">AI Response:</div>
                    <p className="text-gray-700 mb-8 text-lg leading-relaxed font-light">{demoSteps[0].response}</p>
                    
                    <div className="space-y-4">
                      <div className="text-lg font-medium text-gray-900 mb-4">📹 Related Videos:</div>
                      {demoSteps[0].videos.map((video, index) => (
                        <div key={index} className="flex space-x-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                          <div className="w-28 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Play className="w-7 h-7 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-medium text-gray-900 mb-1">{video.title}</div>
                            <div className="text-sm text-gray-600">{video.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Workflow */}
            <div className="mb-24 mt-32 slide-left">
              <h2 className="text-5xl font-thin text-center mb-20 text-gray-900">How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-blue-500 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-medium text-2xl group-hover:scale-110 transition-transform shadow-lg">1</div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-900">Ask Question</h3>
                  <p className="text-gray-600 text-lg leading-relaxed font-light">Type any question in natural language</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gray-800 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-medium text-2xl group-hover:scale-110 transition-transform shadow-lg">2</div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-900">AI Analysis</h3>
                  <p className="text-gray-600 text-lg leading-relaxed font-light">Advanced AI understands and processes instantly</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-blue-500 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-medium text-2xl group-hover:scale-110 transition-transform shadow-lg">3</div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-900">Video Results</h3>
                  <p className="text-gray-600 text-lg leading-relaxed font-light">Get curated educational videos from top sources</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gray-800 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-medium text-2xl group-hover:scale-110 transition-transform shadow-lg">4</div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-900">Master</h3>
                  <p className="text-gray-600 text-lg leading-relaxed font-light">Watch, learn, and master complex concepts</p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center bg-black rounded-3xl p-20 text-white shadow-2xl slide-right">
              <h2 className="text-5xl font-thin mb-8">Ready to transform your learning?</h2>
              <p className="text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300 font-light">
                Join thousands of students already using AI to Master Anything faster than ever
              </p>
              <Link
                href="/apple-theme/chat"
                className="inline-flex items-center px-10 py-5 bg-white text-black rounded-2xl hover:bg-gray-100 transition-colors text-xl font-medium shadow-xl"
              >
                Start Learning Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
              <div className="mt-10 text-gray-400">
                <p className="text-lg font-light">No signup required • Free forever • Instant results</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <AppleFooter />
      </div>
    </AppleSmoothScroll>
  )
}