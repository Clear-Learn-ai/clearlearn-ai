'use client'

import { useEffect, useRef } from 'react'
// import Lenis from 'lenis'
// import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'

// GSAP plugins removed - simplified scrolling
// if (typeof window !== 'undefined') {
//   // gsap.registerPlugin(ScrollTrigger)
// }

interface SmoothScrollProps {
  children: React.ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Update ScrollTrigger on scroll
    lenis.on('scroll', () => {
      ScrollTrigger.update()
    })

    // GSAP ScrollTrigger integration
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  return <>{children}</>
}

// Hook for scroll-based animations
export function useScrollAnimation() {
  useEffect(() => {
    const animations = [
      // Fade in elements on scroll
      gsap.utils.toArray('.fade-in').forEach((element: any) => {
        gsap.fromTo(element, 
          { 
            opacity: 0, 
            y: 100 
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        )
      }),

      // Slide in from left
      gsap.utils.toArray('.slide-left').forEach((element: any) => {
        gsap.fromTo(element,
          {
            x: -100,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        )
      }),

      // Slide in from right
      gsap.utils.toArray('.slide-right').forEach((element: any) => {
        gsap.fromTo(element,
          {
            x: 100,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        )
      }),

      // Scale in effect
      gsap.utils.toArray('.scale-in').forEach((element: any) => {
        gsap.fromTo(element,
          {
            scale: 0.8,
            opacity: 0
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        )
      }),

      // Parallax effect for background elements
      gsap.utils.toArray('.parallax').forEach((element: any) => {
        gsap.to(element, {
          yPercent: -50,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        })
      }),

      // Text reveal animation
      gsap.utils.toArray('.text-reveal').forEach((element: any) => {
        const chars = element.querySelectorAll('.char')
        gsap.fromTo(chars,
          {
            opacity: 0,
            y: 100,
            rotationX: -90
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })
    ]

    return () => {
      // Cleanup animations
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
}

// Utility component for animated sections
export function AnimatedSection({ 
  children, 
  className = '', 
  animation = 'fade-in' 
}: {
  children: React.ReactNode
  className?: string
  animation?: 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in' | 'parallax'
}) {
  return (
    <div className={`${animation} ${className}`}>
      {children}
    </div>
  )
}