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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Interactive Hero Section */}
        <InteractiveHero />
        
        {/* Reactive Navigation */}
        <ReactiveNavbar />

        {/* Content sections with light theme */}
        <section className="bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-24">
            {/* Interactive Demo */}
            <div className="bg-white rounded-3xl p-12 mb-20 border border-gray-200 shadow-2xl fade-in">
              <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">Try it yourself</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Question Side */}
                <div>
                  <div className="mb-8">
                    <div className="text-xl font-semibold text-gray-700 mb-6">Try asking:</div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg">
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="w-7 h-7 text-blue-600" />
                        <span className="text-gray-900 text-xl font-medium">{demoSteps[0].question}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/chat"
                    className="inline-flex items-center px-8 py-4 bg-black text-white text-lg font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
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
                        <div key={index} className="flex space-x-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                          <div className="w-28 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <Play className="w-7 h-7 text-blue-600" />
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

            {/* Product Demo Section */}
            <div className="text-center mb-20 fade-in" id="demo-section">
              <h2 className="text-5xl font-bold text-gray-900 mb-12">See it in action</h2>
              <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-2xl max-w-5xl mx-auto">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-auto"
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

            {/* Simple Workflow */}
            <div className="mb-24 slide-left">
              <h2 className="text-5xl font-bold text-gray-900 text-center mb-20">How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">1</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Ask Question</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Type any question in natural language</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">2</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Analysis</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Advanced AI understands and processes instantly</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">3</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Video Results</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Get curated educational videos from top sources</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl mx-auto mb-8 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">4</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Master</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Watch, learn, and master complex concepts</p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center bg-gradient-to-br from-gray-900 to-black rounded-3xl p-20 text-white shadow-2xl slide-right">
              <h2 className="text-5xl font-bold mb-8">Ready to transform your learning?</h2>
              <p className="text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300">
                Join thousands of students already using AI to master any subject faster than ever
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center px-10 py-5 bg-white text-black rounded-2xl hover:bg-gray-100 transition-colors text-xl font-semibold shadow-xl"
              >
                Start Learning Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
              <div className="mt-10 text-gray-400">
                <p className="text-lg">No signup required • Free forever • Instant results</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  )
}