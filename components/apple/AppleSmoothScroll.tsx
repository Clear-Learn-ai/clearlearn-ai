'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AppleSmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export function useAppleScrollAnimation() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

interface AppleAnimatedSectionProps {
  children: React.ReactNode
  animation?: 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in'
  className?: string
}

export function AppleAnimatedSection({ 
  children, 
  animation = 'fade-in', 
  className 
}: AppleAnimatedSectionProps) {
  return (
    <motion.div
      className={cn(animation, className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}