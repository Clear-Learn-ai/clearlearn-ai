'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Play, 
  ArrowRight,
  MessageSquare,
  Video
} from 'lucide-react'
import { InteractiveHero } from '@/components/InteractiveHero'
import { MagneticCursor } from '@/components/MagneticCursor'
import { SmoothScroll, useScrollAnimation } from '@/components/SmoothScroll'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0)
  useScrollAnimation()

  const demoSteps = [
    {
      question: "How does photosynthesis work?",
      response: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This fundamental biological process occurs in chloroplasts and involves two main stages: light-dependent reactions and the Calvin cycle...",
      videos: [
        {
          title: "Photosynthesis Explained - Light and Dark Reactions",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          duration: "12:34"
        },
        {
          title: "Chloroplast Structure and Function",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", 
          duration: "8:45"
        }
      ]
    }
  ]

  return (
    <SmoothScroll>
      <MagneticCursor />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Interactive Hero Section */}
        <InteractiveHero />
        
        {/* Reactive Navigation */}
        <ReactiveNavbar />

        {/* Product Demo Section - MOVED FIRST */}
        <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center fade-in" id="demo-section">
              <h2 className="text-6xl font-bold mb-12" style={{ color: '#1E0F2E' }}>See it in action</h2>
              <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-2xl w-full max-w-6xl mx-auto">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-auto"
                  style={{ minHeight: '70vh' }}
                >
                  <source src="/Demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </div>
              <p className="text-gray-600 mt-8 text-xl max-w-3xl mx-auto leading-relaxed">
                Watch how Clearlearn instantly understands your questions and provides curated video explanations
              </p>
            </div>
          </div>
        </section>

        {/* Try it yourself section */}
        <section className="bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-24 w-full">
            {/* Interactive Demo */}
            <div className="bg-white rounded-3xl p-12 mb-20 border border-gray-200 shadow-2xl fade-in">
              <h3 className="text-5xl font-bold text-center mb-16" style={{ color: '#1E0F2E' }}>Try it yourself</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Question Side */}
                <div>
                  <div className="mb-8">
                    <div className="text-xl font-semibold text-gray-700 mb-6">Try asking:</div>
                    <div className="amethyst-gradient-light rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-lg">
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: '#1E0F2E' }} />
                        <span className="text-gray-900 text-xl font-medium">{demoSteps[0].question}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/chat"
                    className="inline-flex items-center px-8 py-4 text-white text-lg font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl amethyst-gradient hover:opacity-90"
                  >
                    <Play className="w-5 h-5 mr-3" />
                    Try it yourself
                  </Link>
                </div>

                {/* Response Side */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
                    <div className="text-xl font-semibold text-gray-800 mb-6">AI Response:</div>
                    <p className="text-gray-700 mb-8 text-lg leading-relaxed">{demoSteps[0].response}</p>
                    
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-gray-900 mb-4">📹 Related Videos:</div>
                      {demoSteps[0].videos.map((video, index) => (
                        <div key={index} className="flex space-x-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer">
                          <div className="w-28 h-20 amethyst-gradient rounded-lg flex items-center justify-center">
                            <Play className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-900 mb-1">{video.title}</div>
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
            <div className="mb-24 slide-left">
              <h2 className="text-5xl font-bold text-center mb-20" style={{ color: '#1E0F2E' }}>How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg amethyst-gradient">1</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E0F2E' }}>Ask Question</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Type any question in natural language</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg" style={{ background: 'linear-gradient(135deg, #B87A7A 0%, #1E0F2E 100%)' }}>2</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E0F2E' }}>AI Analysis</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Advanced AI understands and processes instantly</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg" style={{ background: 'linear-gradient(135deg, #7B4397 0%, #B87A7A 100%)' }}>3</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E0F2E' }}>Video Results</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Get curated educational videos from top sources</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg" style={{ background: 'linear-gradient(135deg, #3D1A78 0%, #E6B3BA 100%)' }}>4</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E0F2E' }}>Master</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Watch, learn, and master complex concepts</p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center rounded-3xl p-20 text-white shadow-2xl slide-right amethyst-gradient">
              <h2 className="text-5xl font-bold mb-8">Ready to transform your learning?</h2>
              <p className="text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/90">
                Join thousands of students already using AI to master any subject faster than ever
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center px-10 py-5 bg-white rounded-2xl hover:bg-gray-100 transition-colors text-xl font-semibold shadow-xl"
                style={{ color: '#1E0F2E' }}
              >
                Start Learning Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
              <div className="mt-10 text-white/80">
                <p className="text-lg">No signup required • Free forever • Instant results</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  )
}