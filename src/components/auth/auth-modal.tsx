'use client'

import { useState } from 'react'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'
import { OAuthButtons } from './oauth-buttons'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [error, setError] = useState<string | null>(null)
  const [_loading, _setLoading] = useState(false)

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const clearError = () => {
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
        
        <div className="relative bg-gray-900 rounded-2xl p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM4.929 19.071A9.969 9.969 0 0112 22a9.969 9.969 0 017.071-2.929M20 12V6a8 8 0 10-16 0v6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-400">
              {mode === 'login' 
                ? 'Sign in to your TradeAI Tutor account' 
                : 'Join thousands of trade professionals learning with AI'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="space-y-6">
            <OAuthButtons onLoading={setLoading} onError={handleError} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
              </div>
            </div>

            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onError={handleError}
                onSwitchToSignUp={() => {
                  setMode('signup')
                  clearError()
                }}
              />
            ) : (
              <SignupForm
                onSuccess={handleSuccess}
                onError={handleError}
                onSwitchToLogin={() => {
                  setMode('login')
                  clearError()
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}