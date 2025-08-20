'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Brain, Video, Search, Users, Zap, Globe } from 'lucide-react'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced AI understands your questions and provides personalized explanations tailored to your learning style."
    },
    {
      icon: Video,
      title: "Curated Video Content",
      description: "Access thousands of educational videos from top sources, automatically selected based on your queries."
    },
    {
      icon: Search,
      title: "Intelligent Search",
      description: "Natural language processing allows you to ask questions in plain English and get precise answers."
    },
    {
      icon: Users,
      title: "Adaptive Interface",
      description: "Clean, intuitive interface that adapts to your learning preferences and progress."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get immediate responses with relevant explanations and supporting video content."
    },
    {
      icon: Globe,
      title: "Any Subject",
      description: "From science and math to history and literature - master any subject with AI guidance."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <ReactiveNavbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-6xl font-bold mb-6" style={{ color: '#1E0F2E' }}>
              Powerful Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Clearlearn revolutionizes learning with cutting-edge AI technology and intuitive design.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 amethyst-gradient"
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#1E0F2E' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-20"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-200">
              <h2 className="text-4xl font-bold mb-6" style={{ color: '#1E0F2E' }}>
                Ready to experience the future of learning?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already mastering complex subjects faster than ever.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl amethyst-gradient hover:opacity-90"
              >
                Start Learning Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}