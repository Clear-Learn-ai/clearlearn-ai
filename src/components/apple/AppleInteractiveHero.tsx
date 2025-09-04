'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { AppleMagneticButton } from './AppleMagneticCursor'
import { AppleAnimatedSection } from './AppleSmoothScroll'

export function AppleInteractiveHero() {
  const containerRef = useRef<HTMLElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  
  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200])
  const contentY = useTransform(scrollY, [0, 1000], [0, -50])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleStartLearning = () => {
    window.location.href = '/apple-theme/chat'
  }

  return (
    <motion.section
      ref={containerRef}
      className="relative bg-white overflow-hidden flex items-center justify-center"
      style={{ 
        height: '100vh',
        minHeight: '100vh',
        opacity 
      }}
    >
      {/* Clean minimalist background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white" />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center"
        style={{ y: contentY }}
      >
        {/* Apple-style Typography */}
        <div className="text-center">
          <motion.h1 
            className="text-8xl md:text-9xl font-thin mb-8 leading-none text-black tracking-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            Master Anything
          </motion.h1>
          <motion.p 
            className="text-3xl md:text-4xl text-gray-600 font-light mb-12 max-w-4xl mx-auto tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            with AI-Powered Visual Learning
          </motion.p>
        </div>

        {/* Apple-style action buttons */}
        <AppleAnimatedSection animation="scale-in" className="mt-16 space-y-6">
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <AppleMagneticButton
              variant="primary"
              onClick={handleStartLearning}
              className="group px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </AppleMagneticButton>

            <AppleMagneticButton
              variant="secondary"
              onClick={() => {
                document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group px-8 py-4 border border-gray-300 text-gray-800 rounded-full hover:border-gray-400 transition-all font-medium"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </AppleMagneticButton>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-16 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            {[
              { icon: Sparkles, text: 'AI-Powered Explanations' },
              { icon: Play, text: 'Interactive Video Learning' },
              { icon: ArrowRight, text: 'Instant Understanding' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-sm font-light tracking-wide"
                whileHover={{ scale: 1.05, color: '#3b82f6' }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-4 h-4" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </AppleAnimatedSection>
      </motion.div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left accent */}
        <motion.div
          className="absolute top-32 left-32 w-24 h-24 rounded-full blur-2xl bg-blue-200/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Bottom-right accent */}
        <motion.div
          className="absolute bottom-32 right-32 w-32 h-32 rounded-full blur-2xl bg-gray-200/40"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 3 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-wider font-light">Scroll to explore</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-gray-400 to-transparent" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}