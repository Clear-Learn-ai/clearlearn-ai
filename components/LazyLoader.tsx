'use client'

import { useState, useEffect, Suspense, lazy, ComponentType } from 'react'

interface LazyLoaderProps {
  component: string
  fallback?: React.ReactNode
  delay?: number
  preload?: boolean
}

interface EducationalLoadingProps {
  concept?: string
  duration?: number
  facts?: string[]
}

// Lazy load heavy components
const LazyThreeJS = lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })))
const LazyP5 = lazy(() => import('react-p5-wrapper' as any).then(module => ({ default: module.P5Wrapper })))
const LazyD3 = lazy(() => import('d3').then(() => ({ default: () => <div>D3 Component</div> })))

// Educational facts for loading states
const educationalFacts = {
  general: [
    "The human brain can process visual information 60,000 times faster than text!",
    "Studies show that people learn 400% faster with visual and interactive content.",
    "Your brain creates new neural pathways every time you learn something new.",
    "The average attention span for learning is 7-10 minutes - perfect for our content!",
    "Visual learners make up 65% of the population - that's why we use multiple modalities.",
    "Interactive learning increases retention by up to 90% compared to passive reading.",
    "The brain's plasticity means you can learn new skills at any age!",
    "Spaced repetition can improve long-term retention by 200%."
  ],
  science: [
    "Did you know? A single DNA molecule contains 3 billion base pairs!",
    "Fun fact: Quantum entanglement was called 'spooky action at a distance' by Einstein.",
    "Amazing: Photosynthesis converts 120 billion tons of CO2 annually!",
    "Cool fact: Your brain uses 20% of your body's energy despite being 2% of your weight.",
    "Incredible: There are more bacteria in your body than human cells!"
  ],
  technology: [
    "Mind-blowing: Google processes 8.5 billion searches per day!",
    "Fun fact: The first computer bug was an actual bug - a moth stuck in a relay!",
    "Amazing: A modern smartphone has more computing power than NASA used for Apollo 11.",
    "Did you know? The internet weighs about the same as a strawberry!",
    "Cool fact: 90% of the world's data was created in the last 2 years."
  ],
  math: [
    "Amazing: There are more possible chess games than atoms in the observable universe!",
    "Fun fact: The word 'algorithm' comes from a 9th-century Persian mathematician.",
    "Cool: Zero was invented in India around 628 AD - imagine math without it!",
    "Did you know? Pi has been calculated to over 31 trillion decimal places!",
    "Incredible: The Fibonacci sequence appears everywhere in nature!"
  ]
}

const EducationalLoading: React.FC<EducationalLoadingProps> = ({ 
  concept = 'general', 
  duration = 3000,
  facts 
}) => {
  const [currentFact, setCurrentFact] = useState(0)
  const [progress, setProgress] = useState(0)
  
  const selectedFacts = facts || educationalFacts[concept as keyof typeof educationalFacts] || educationalFacts.general
  
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % selectedFacts.length)
    }, 2000)
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + (100 / (duration / 100))
      })
    }, 100)
    
    return () => {
      clearInterval(factInterval)
      clearInterval(progressInterval)
    }
  }, [duration, selectedFacts.length])
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <div className="mb-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🧠 Preparing Your Learning Experience
        </h3>
        
        <div className="mb-4 h-12 flex items-center justify-center">
          <p className="text-sm text-gray-600 transition-opacity duration-500">
            {selectedFacts[currentFact]}
          </p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-gray-500">
          {Math.round(progress)}% complete
        </div>
      </div>
    </div>
  )
}

const SmartPreloader: React.FC<{ components: string[] }> = ({ components }) => {
  useEffect(() => {
    // Preload components in the background
    const preloadPromises = components.map(async (component) => {
      switch (component) {
        case 'threejs':
          return import('@react-three/fiber')
        case 'p5':
          return import('react-p5-wrapper' as any) 
        case 'd3':
          return import('d3')
        default:
          return Promise.resolve()
      }
    })
    
    Promise.allSettled(preloadPromises).then(() => {
      console.log('📦 Preloaded heavy components:', components)
    })
  }, [components])
  
  return null
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component, 
  fallback,
  delay = 0,
  preload = false 
}) => {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  if (!isReady) {
    return fallback || <EducationalLoading concept="general" duration={delay} />
  }
  
  const getComponent = (): ComponentType<any> => {
    switch (component) {
      case 'threejs':
        return LazyThreeJS
      case 'p5':
        return LazyP5
      case 'd3':
        return LazyD3
      default:
        return () => <div>Component not found</div>
    }
  }
  
  const LazyComponent = getComponent()
  
  return (
    <Suspense fallback={fallback || <EducationalLoading />}>
      <LazyComponent />
      {preload && <SmartPreloader components={[component]} />}
    </Suspense>
  )
}

export { LazyLoader, EducationalLoading, SmartPreloader }

// Hook for managing loading states with educational content
export const useEducationalLoading = (concept: string = 'general') => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const startLoading = (estimatedDuration: number = 2000) => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95 // Stop at 95% until manually completed
        }
        return prev + (100 / (estimatedDuration / 100))
      })
    }, 100)
    
    return interval
  }
  
  const completeLoading = () => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 500)
  }
  
  const LoadingComponent = () => (
    <EducationalLoading 
      concept={concept} 
      duration={2000}
    />
  )
  
  return {
    isLoading,
    progress,
    startLoading,
    completeLoading,
    LoadingComponent
  }
}