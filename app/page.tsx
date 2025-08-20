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

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0)
  useScrollAnimation()

  const demoSteps = [
    {
      question: "Explain SN1 vs SN2 reactions",
      response: "SN1 and SN2 are two different nucleophilic substitution mechanisms. SN1 involves a two-step process with carbocation formation, while SN2 is a concerted one-step reaction...",
      videos: [
        {
          title: "SN1 vs SN2 Reaction Mechanisms",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          duration: "12:34"
        },
        {
          title: "Nucleophilic Substitution Examples",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", 
          duration: "8:45"
        }
      ]
    }
  ]

  return (
    <SmoothScroll>
      <MagneticCursor />
      <div className="min-h-screen bg-black">
        {/* Interactive Hero Section */}
        <InteractiveHero />
        
        {/* Premium Navigation - Fixed */}
        <nav className="fixed top-0 left-0 right-0 border-b border-white/10 bg-black/80 backdrop-blur-lg z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-white">AI Tutor</div>
              <Link
                href="/chat"
                className="px-6 py-3 bg-white text-black text-base font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try it free
              </Link>
            </div>
          </div>
        </nav>

        {/* Content sections with dark theme */}
        <section className="bg-black text-white relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-24">
            {/* Interactive Demo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 mb-20 border border-white/10 fade-in">
              <h3 className="text-3xl font-bold text-center text-white mb-12">Try it yourself</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Question Side */}
                <div>
                  <div className="mb-8">
                    <div className="text-lg font-semibold text-gray-300 mb-4">Try asking:</div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                        <span className="text-white text-lg font-medium">{demoSteps[0].question}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/chat"
                    className="inline-flex items-center px-6 py-3 bg-white text-black text-base font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try it yourself
                  </Link>
                </div>

                {/* Response Side */}
                <div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="text-lg font-semibold text-gray-300 mb-4">AI Response:</div>
                    <p className="text-white mb-6 text-lg leading-relaxed">{demoSteps[0].response}</p>
                    
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-white mb-4">Related Videos:</div>
                      {demoSteps[0].videos.map((video, index) => (
                        <div key={index} className="flex space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors cursor-pointer">
                          <div className="w-24 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-white">{video.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{video.duration}</div>
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
              <h2 className="text-4xl font-bold text-white mb-12">See it in action</h2>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 max-w-5xl mx-auto">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
                Watch how AI Tutor instantly understands your questions and provides curated video explanations
              </p>
            </div>

            {/* Simple Workflow */}
            <div className="mb-24 slide-left">
              <h2 className="text-4xl font-bold text-white text-center mb-16">How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="text-center group scale-in">
                  <div className="w-16 h-16 bg-white text-black rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">1</div>
                  <h3 className="text-xl font-bold mb-4 text-white">Ask Question</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">Type any question in natural language</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-16 h-16 bg-white text-black rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">2</div>
                  <h3 className="text-xl font-bold mb-4 text-white">AI Analysis</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">Advanced AI understands and processes your question instantly</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-16 h-16 bg-white text-black rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">3</div>
                  <h3 className="text-xl font-bold mb-4 text-white">Video Results</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">Get perfectly curated educational videos from top sources</p>
                </div>
                <div className="text-center group scale-in">
                  <div className="w-16 h-16 bg-white text-black rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">4</div>
                  <h3 className="text-xl font-bold mb-4 text-white">Master</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">Watch, learn, and master complex concepts</p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-16 border border-white/10 slide-right">
              <h2 className="text-4xl font-bold mb-6 text-white">Ready to transform your learning?</h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-gray-300">
                Join thousands of students already using AI to master any subject faster than ever
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <div className="mt-8 text-gray-400">
                <p className="text-base">No signup required • Free forever • Instant results</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  )
}