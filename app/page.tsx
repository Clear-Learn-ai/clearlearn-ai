'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Beaker, 
  Video, 
  Brain, 
  MessageSquare, 
  Play, 
  ArrowRight,
  CheckCircle,
  BookOpen,
  Lightbulb,
  Star
} from 'lucide-react'

// Molecular structure SVG background
const MoleculeBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <svg className="absolute top-10 left-10 w-32 h-32 text-blue-500" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="20" cy="20" r="4"/>
      <circle cx="80" cy="20" r="4"/>
      <circle cx="50" cy="50" r="4"/>
      <circle cx="20" cy="80" r="4"/>
      <circle cx="80" cy="80" r="4"/>
      <line x1="20" y1="20" x2="50" y2="50" stroke="currentColor" strokeWidth="2"/>
      <line x1="80" y1="20" x2="50" y2="50" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="50" x2="20" y2="80" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="50" x2="80" y2="80" stroke="currentColor" strokeWidth="2"/>
    </svg>
    <svg className="absolute top-40 right-20 w-24 h-24 text-green-500" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="30" cy="30" r="3"/>
      <circle cx="70" cy="30" r="3"/>
      <circle cx="30" cy="70" r="3"/>
      <circle cx="70" cy="70" r="3"/>
      <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="2"/>
      <line x1="70" y1="30" x2="70" y2="70" stroke="currentColor" strokeWidth="2"/>
      <line x1="70" y1="70" x2="30" y2="70" stroke="currentColor" strokeWidth="2"/>
      <line x1="30" y1="70" x2="30" y2="30" stroke="currentColor" strokeWidth="2"/>
    </svg>
    <svg className="absolute bottom-20 left-1/4 w-28 h-28 text-purple-500" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="20" r="4"/>
      <circle cx="20" cy="35" r="4"/>
      <circle cx="80" cy="35" r="4"/>
      <circle cx="35" cy="65" r="4"/>
      <circle cx="65" cy="65" r="4"/>
      <circle cx="50" cy="80" r="4"/>
      <line x1="50" y1="20" x2="20" y2="35" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="20" x2="80" y2="35" stroke="currentColor" strokeWidth="2"/>
      <line x1="20" y1="35" x2="35" y2="65" stroke="currentColor" strokeWidth="2"/>
      <line x1="80" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="2"/>
      <line x1="35" y1="65" x2="50" y2="80" stroke="currentColor" strokeWidth="2"/>
      <line x1="65" y1="65" x2="50" y2="80" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
)

export default function LandingPage() {
  const [hoveredExample, setHoveredExample] = useState<number | null>(null)

  const exampleQuestions = [
    {
      question: "Explain SN1 vs SN2 reactions",
      description: "Understand nucleophilic substitution mechanisms with clear visual explanations"
    },
    {
      question: "How does benzene aromatic substitution work?",
      description: "Master electrophilic aromatic substitution with step-by-step mechanisms"
    },
    {
      question: "Show me aldol condensation mechanism",
      description: "Learn aldol reactions with detailed electron movement and product formation"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Beaker className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OrganicAI Tutor</span>
            </div>
            <Link
              href="/chat"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Tutoring
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <MoleculeBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Master Organic Chemistry
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent block">
                with AI-Powered Visual Learning
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto"
            >
              Get instant <strong>video explanations</strong> for any organic chemistry concept. 
              Designed specifically for <em className="text-blue-600 font-semibold">pre-med students</em> 
              who need to master complex reactions and mechanisms.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link 
                href="/chat"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Play className="inline w-5 h-5 mr-2" />
                Start Learning
              </Link>
              <div className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-400 font-medium text-lg transition-colors cursor-pointer">
                <Video className="inline w-5 h-5 mr-2" />
                Watch Demo
              </div>
            </motion.div>

            {/* Value Props */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Explanations</h3>
                <p className="text-gray-600">Get personalized answers to your specific organic chemistry questions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Curated Video Content</h3>
                <p className="text-gray-600">Access relevant educational videos from top chemistry educators</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Visual Mechanisms</h3>
                <p className="text-gray-600">Understand complex reaction mechanisms with clear visual representations</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ask Any Organic Chemistry Question
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Try these example questions or ask your own. Our AI tutor provides instant explanations 
              with relevant video content to help you understand complex concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exampleQuestions.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                onMouseEnter={() => setHoveredExample(index)}
                onMouseLeave={() => setHoveredExample(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      "{example.question}"
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {example.description}
                    </p>
                    <div className={`flex items-center text-blue-600 font-medium transition-all duration-200 ${hoveredExample === index ? 'transform translate-x-2' : ''}`}>
                      Try this question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/chat"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Learning Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Pre-Med Students Choose OrganicAI
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Instant Expert Explanations</h3>
                    <p className="text-gray-600">Get immediate, accurate answers to complex organic chemistry questions, available 24/7</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Visual Learning Support</h3>
                    <p className="text-gray-600">Understand 3D molecular structures and reaction mechanisms with video explanations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">MCAT Preparation</h3>
                    <p className="text-gray-600">Master the organic chemistry concepts essential for MCAT success</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 relative overflow-hidden">
              <MoleculeBackground />
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-6">🧪</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Interactive Learning Experience</h3>
                <p className="text-gray-600 mb-6">
                  Ask questions, get explanations, watch videos, and master organic chemistry 
                  concepts in an engaging, interactive environment.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1000+</div>
                    <div className="text-sm text-gray-600">Reactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">500+</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Organic Chemistry?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of pre-med students who are already using AI to excel in organic chemistry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium text-lg transition-colors shadow-lg"
            >
              🚀 Start Learning Now
            </Link>
            <div className="px-8 py-4 border-2 border-white/30 text-white rounded-lg hover:border-white/50 font-medium text-lg transition-colors cursor-pointer">
              📖 Learn More
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Beaker className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">OrganicAI Tutor</span>
              </div>
              <p className="text-gray-400">
                AI-powered organic chemistry tutoring designed specifically for pre-med students.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <div className="space-y-2 text-gray-400">
                <div>AI Explanations</div>
                <div>Video Content</div>
                <div>Visual Mechanisms</div>
                <div>MCAT Prep</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Study Guides</div>
                <div>Tutorials</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OrganicAI Tutor. Empowering pre-med students to excel in organic chemistry.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}