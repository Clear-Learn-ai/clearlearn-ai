'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, Menu, X } from 'lucide-react'

export function ReactiveNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { scrollY } = useScroll()
  
  // Transform values based on scroll
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.95)']
  )
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(20px)']
  )
  
  const borderOpacity = useTransform(
    scrollY,
    [0, 100],
    [0, 0.2]
  )

  const padding = useTransform(
    scrollY,
    [0, 100],
    ['24px', '16px']
  )

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        borderBottomWidth: '1px',
        borderBottomColor: `rgba(229, 231, 235, ${borderOpacity.get()})`,
      }}
    >
      <motion.div 
        className="max-w-7xl mx-auto px-6"
        style={{ paddingTop: padding, paddingBottom: padding }}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              className="text-2xl font-bold"
              style={{ color: '#1E0F2E' }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Clearlearn
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Features
            </Link>
            <Link 
              href="/#demo-section" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Demo
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/chat"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/signin"
                    className="px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl amethyst-gradient hover:opacity-90"
                  >
                    Try it free
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4 border-t border-gray-200 mt-4">
            <Link 
              href="/features" 
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/#demo-section" 
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </Link>
            <Link 
              href="/pricing" 
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {session ? (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <Link
                  href="/chat"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <Link
                  href="/auth/signin"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="block w-full text-center px-6 py-3 text-white font-semibold rounded-xl amethyst-gradient"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Try it free
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.nav>
  )
}