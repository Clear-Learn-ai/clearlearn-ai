'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Play, BookOpen, Brain, Zap } from 'lucide-react'
import { SimpleVideoPlayer } from '@/components/SimpleVideoPlayer'

export default function Demo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            See Clearlearn in Action
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Watch how AI-powered visual learning transforms complex concepts into easy-to-understand explanations
          </motion.p>
        </div>

        {/* Demo Video */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SimpleVideoPlayer
            videoId="VFl7Hrm5q-s"
            title="Clearlearn Demo - How Photosynthesis Works"
          />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Brain,
              title: "AI-Powered Explanations",
              description: "Our AI analyzes your question and creates personalized visual explanations tailored to your learning style."
            },
            {
              icon: Play,
              title: "Curated Video Content",
              description: "Get access to hand-picked educational videos that perfectly complement your learning journey."
            },
            {
              icon: Zap,
              title: "Instant Understanding",
              description: "Complex concepts become clear in minutes, not hours. Learn faster with visual learning techniques."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start Learning Now
          </Link>
        </motion.div>
      </div>
    </div>
  )
}