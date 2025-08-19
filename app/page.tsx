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

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0)

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
    <div className="min-h-screen bg-white">
      {/* Premium Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-black">OrganicAI</div>
            <Link
              href="/chat"
              className="px-6 py-3 bg-black text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Ask Any Organic Chemistry Question,<br />
            Get Instant Video Explanations
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn organic chemistry faster with AI-curated video explanations tailored to your learning style
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-black text-white text-xl font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            Start Learning Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        {/* Interactive Demo */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-20 border border-gray-200">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Try it yourself</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Question Side */}
            <div>
              <div className="mb-8">
                <div className="text-lg font-semibold text-gray-700 mb-4">Try asking:</div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-900 text-lg font-medium">{demoSteps[0].question}</span>
                  </div>
                </div>
              </div>
              
              <Link
                href="/chat"
                className="inline-flex items-center px-6 py-3 bg-black text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Try it yourself
              </Link>
            </div>

            {/* Response Side */}
            <div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-lg font-semibold text-gray-700 mb-4">AI Response:</div>
                <p className="text-gray-900 mb-6 text-lg leading-relaxed">{demoSteps[0].response}</p>
                
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-gray-900 mb-4">Related Videos:</div>
                  {demoSteps[0].videos.map((video, index) => (
                    <div key={index} className="flex space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-900">{video.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{video.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Demo Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">See it in action</h2>
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
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
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
            Watch how OrganicAI instantly understands your chemistry questions and provides curated video explanations
          </p>
        </div>

        {/* Simple Workflow */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Ask Question</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Type any organic chemistry question in natural language</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">AI Analysis</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Advanced AI understands and processes your question instantly</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Video Results</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Get perfectly curated educational videos from top sources</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-xl mx-auto mb-6 flex items-center justify-center font-bold text-xl">4</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Master</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Watch, learn, and master complex chemistry concepts</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gray-900 rounded-2xl p-16 text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to transform your chemistry learning?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-gray-300">
            Join thousands of students already using AI to master organic chemistry faster than ever
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Start Learning Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <div className="mt-8 text-gray-400">
            <p className="text-base">No signup required • Free forever • Instant results</p>
          </div>
        </div>
      </section>
    </div>
  )
}