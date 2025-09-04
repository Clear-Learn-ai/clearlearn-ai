import React, { useEffect } from 'react'

interface TerminalLandingClientProps {
  children: React.ReactNode
}

export function TerminalLandingClient({ children }: TerminalLandingClientProps) {
  useEffect(() => {
    // Simple scroll effect without heavy dependencies
    const handleScroll = () => {
      const scrolled = window.scrollY
      const rate = scrolled * -0.5

      // Apply simple parallax effect to elements with data-speed attribute
      const parallaxElements = document.querySelectorAll('[data-speed]')
      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '0')
        ;(element as HTMLElement).style.transform = `translateY(${rate * speed}px)`
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative">
      {children}
    </div>
  )
}