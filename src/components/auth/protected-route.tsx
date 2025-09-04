'use client'

import { useAuth } from './auth-provider'
import { AuthModal } from './auth-modal'
import { useState, useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectMessage?: string
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectMessage = "Please sign in to access this feature"
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasTriedAuth, setHasTriedAuth] = useState(false)

  useEffect(() => {
    if (!loading && !user && !hasTriedAuth) {
      setShowAuthModal(true)
      setHasTriedAuth(true)
    }
  }, [loading, user, hasTriedAuth])

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const handleAuthClose = () => {
    setShowAuthModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
              <p className="text-gray-400 mb-8">{redirectMessage}</p>
              
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
          </div>
        )}
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          initialMode="login"
        />
      </>
    )
  }

  return <>{children}</>
}

interface RequireAuthProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function RequireAuth({ children, fallback, loading }: RequireAuthProps) {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return loading || (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="text-center p-8">
        <p className="text-gray-400 mb-4">You must be signed in to view this content</p>
        <AuthModal isOpen={true} onClose={() => {}} />
      </div>
    )
  }

  return <>{children}</>
}