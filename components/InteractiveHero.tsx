'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { KineticTypography } from './KineticTypography'
import { MagneticButton } from './MagneticCursor'
import { AnimatedSection } from './SmoothScroll'

export function InteractiveHero() {
  const containerRef = useRef<HTMLElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  
  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -300])
  const contentY = useTransform(scrollY, [0, 1000], [0, -100])
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
    // Smooth scroll to chat section or navigate to /chat
    window.location.href = '/chat'
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
      {/* Clean subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-white" />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center"
        style={{ y: contentY }}
      >
        {/* Hero Typography */}
        <div className="text-center">
          <motion.h1 
            className="text-7xl md:text-9xl font-black mb-8 leading-none text-black"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Master Any Subject
          </motion.h1>
          <motion.p 
            className="text-3xl md:text-4xl text-gray-600 font-light mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            with AI-Powered Visual Learning
          </motion.p>
        </div>

        {/* Action buttons */}
        <AnimatedSection animation="scale-in" className="mt-16 space-y-6">
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <MagneticButton
              variant="primary"
              onClick={handleStartLearning}
              className="group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <MagneticButton
              variant="secondary"
              onClick={() => {
                // Scroll to demo video section
                document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </MagneticButton>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-12 text-gray-400"
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
                className="flex items-center gap-2 text-sm font-medium"
                whileHover={{ scale: 1.05, color: '#6366f1' }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-4 h-4" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </motion.div>

      {/* Floating UI elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left accent */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl"
          style={{ backgroundColor: 'rgba(184, 122, 122, 0.4)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Bottom-right accent */}
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 rounded-full blur-xl"
          style={{ backgroundColor: 'rgba(30, 15, 46, 0.3)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Glass morphism overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none" />
    </motion.section>
  )
}