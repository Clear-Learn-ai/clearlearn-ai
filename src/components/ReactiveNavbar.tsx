import React from 'react'
import { Menu, X, User } from 'lucide-react'
import { Button } from './ui/button'

interface ReactiveNavbarProps {
  user?: any
  onAuthClick?: () => void
}

export function ReactiveNavbar({ user, onAuthClick }: ReactiveNavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TradeAI Tutor
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Pricing</Button>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name || user.email}
                </span>
              </div>
            ) : (
              <Button onClick={onAuthClick}>Sign In</Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" className="w-full justify-start">Home</Button>
              <Button variant="ghost" className="w-full justify-start">About</Button>
              <Button variant="ghost" className="w-full justify-start">Pricing</Button>
              {user ? (
                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {user.name || user.email}
                </div>
              ) : (
                <Button onClick={onAuthClick} className="w-full">Sign In</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}