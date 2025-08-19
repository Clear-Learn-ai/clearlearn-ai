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
      {/* Simple Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">OrganicAI</div>
            <Link
              href="/chat"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Ask Any Organic Chemistry Question,<br />
            Get Instant Video Explanations
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Learn organic chemistry faster with AI-curated video explanations
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Question Side */}
            <div>
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Try asking:</div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{demoSteps[0].question}</span>
                  </div>
                </div>
              </div>
              
              <Link
                href="/chat"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Try it yourself
              </Link>
            </div>

            {/* Response Side */}
            <div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-4">
                <div className="text-sm text-gray-600 mb-3">AI Response:</div>
                <p className="text-gray-900 mb-4">{demoSteps[0].response}</p>
                
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">Related Videos:</div>
                  {demoSteps[0].videos.map((video, index) => (
                    <div key={index} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{video.title}</div>
                        <div className="text-xs text-gray-500">{video.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Demo Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">See it in action</h2>
          <div className="bg-gray-100 rounded-xl p-12">
            <div className="text-gray-600 mb-4">Video demo coming soon</div>
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Simple Workflow */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-lg mx-auto mb-4 flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold mb-2">Ask Question</h3>
              <p className="text-gray-600 text-sm">Type any organic chemistry question</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-lg mx-auto mb-4 flex items-center justify-center font-bold">2</div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">AI understands and processes your question</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-lg mx-auto mb-4 flex items-center justify-center font-bold">3</div>
              <h3 className="font-semibold mb-2">Video Results</h3>
              <p className="text-gray-600 text-sm">Get curated educational videos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-lg mx-auto mb-4 flex items-center justify-center font-bold">4</div>
              <h3 className="font-semibold mb-2">Learn</h3>
              <p className="text-gray-600 text-sm">Watch and understand the concept</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to learn faster?</h2>
          <p className="text-gray-600 mb-8">Join students already using AI to master organic chemistry</p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-lg"
          >
            Start learning now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}