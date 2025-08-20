'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { HeroScene3D } from './HeroScene3D'
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
      className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden flex items-center justify-center"
      style={{ opacity }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-cyan-100/30 to-purple-100/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      </motion.div>

      {/* 3D Scene Background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <HeroScene3D />
      </motion.div>

      {/* Grain overlay for texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIj4KICAgICAgPGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHJlc3VsdD0ibm9pc2UiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggaW49Im5vaXNlIiB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] bg-repeat" />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center"
        style={{ y: contentY }}
      >
        {/* Hero Typography */}
        <div className="text-center">
          <motion.h1 
            className="text-7xl md:text-8xl font-black text-gray-900 mb-8 leading-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Master Any Subject
          </motion.h1>
          <motion.p 
            className="text-3xl text-gray-600 font-light mb-12 max-w-4xl mx-auto"
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
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Bottom-right accent */}
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-200/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
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