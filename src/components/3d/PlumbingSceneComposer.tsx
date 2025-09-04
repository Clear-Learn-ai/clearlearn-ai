import React from 'react'
import { Wrench, Hammer, Settings } from 'lucide-react'

interface PlumbingSceneComposerProps {
  installation?: any
  showPerformance?: boolean
  quality?: 'low' | 'medium' | 'high'
  enableEffects?: boolean
  interactive?: boolean
  autoRotate?: boolean
  showGrid?: boolean
  environment?: string
  onComponentSelect?: (component: any) => void
}

export function PlumbingSceneComposer({
  installation = { components: [] },
  showPerformance = false,
  quality = 'medium',
  enableEffects = true,
  interactive = true,
  autoRotate = false,
  showGrid = true,
  environment = 'workshop',
  onComponentSelect
}: PlumbingSceneComposerProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 border">
      <div className="text-center">
        <div className="flex justify-center space-x-4 mb-6">
          <Wrench className="w-12 h-12 text-blue-600" />
          <Hammer className="w-12 h-12 text-green-600" />
          <Settings className="w-12 h-12 text-purple-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          3D Plumbing Simulator
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Interactive 3D visualization temporarily disabled to optimize performance.
          Essential features remain fully functional.
        </p>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Components:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {installation.components?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Quality:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">{quality}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Interactive:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {interactive ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Environment:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">{environment}</span>
            </div>
          </div>
        </div>

        {showPerformance && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Performance monitoring enabled
          </div>
        )}
      </div>
    </div>
  )
}