'use client'

import { useEffect, useRef } from 'react'
// import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AppleMagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const handleMouseEnter = () => {
      cursor.style.opacity = '1'
    }

    const handleMouseLeave = () => {
      cursor.style.opacity = '0'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed w-4 h-4 bg-black/20 rounded-full pointer-events-none z-50 transition-opacity duration-300 mix-blend-difference"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  )
}

interface AppleMagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export function AppleMagneticButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className 
}: AppleMagneticButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center transition-all duration-300",
        variant === 'primary' 
          ? "bg-blue-500 text-white hover:bg-blue-600" 
          : "border border-gray-300 text-gray-800 hover:border-gray-400",
        className
      )}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </button>
  )
}