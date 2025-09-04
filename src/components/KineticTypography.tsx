'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { gsap } from 'gsap'

interface KineticTypographyProps {
  title: string
  subtitle: string
}

export function KineticTypography({ title, subtitle }: KineticTypographyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])
  
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const mouseX = useSpring(0, springConfig)
  const mouseY = useSpring(0, springConfig)

  // Split text into characters for animation
  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <motion.span
        key={index}
        className="inline-block"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: index * 0.05,
          ease: [0.6, 0.01, -0.05, 0.95]
        }}
        whileHover={{
          scale: 1.2,
          color: '#6366f1',
          transition: { duration: 0.2 }
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))
  }

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      
      const x = (clientX / innerWidth) * 2 - 1
      const y = (clientY / innerHeight) * 2 - 1
      
      setMousePosition({ x: clientX, y: clientY })
      mouseX.set(x * 20)
      mouseY.set(y * 20)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Text reveal animation on scroll
  useEffect(() => {
    const titleChars = titleRef.current?.querySelectorAll('.char')
    const subtitleChars = subtitleRef.current?.querySelectorAll('.char')

    if (titleChars && subtitleChars) {
      gsap.fromTo(titleChars, 
        { 
          opacity: 0, 
          y: 100,
          rotationX: -90 
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.03,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )

      gsap.fromTo(subtitleChars,
        {
          opacity: 0,
          y: 50,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.02,
          delay: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="relative z-10 text-center"
      style={{ y, opacity, scale }}
    >
      {/* Main headline */}
      <motion.h1
        ref={titleRef}
        className="text-8xl md:text-9xl font-black text-white mb-6 leading-none tracking-tight"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      >
        <div className="relative">
          {splitText(title)}
          
          {/* Glitch effect overlay */}
          <motion.div
            className="absolute inset-0 text-8xl md:text-9xl font-black text-blue-500 opacity-20"
            animate={{
              x: [0, 2, -2, 0],
              y: [0, -1, 1, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {title}
          </motion.div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent opacity-30">
            {title}
          </div>
        </div>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        ref={subtitleRef}
        className="text-2xl md:text-3xl text-gray-300 font-light tracking-wide max-w-4xl mx-auto"
        style={{
          x: useTransform(mouseX, (x) => x * 0.5),
          y: useTransform(mouseY, (y) => y * 0.5),
        }}
      >
        {splitText(subtitle)}
      </motion.p>

      {/* Animated accent line */}
      <motion.div
        className="mt-8 mx-auto h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
      />

      {/* Floating particles around text */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{
              x: Math.random() * 800,
              y: Math.random() * 400,
              opacity: 0
            }}
            animate={{
              x: Math.random() * 800,
              y: Math.random() * 400,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}