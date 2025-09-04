'use client'

import { useState } from 'react'
import { signInWithEmail, resetPassword } from '@/lib/supabase'

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (_error: string) => void
  onSwitchToSignUp?: () => void
}

export function LoginForm({ onSuccess, onError, onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (resetMode) {
      await handlePasswordReset()
      return
    }

    if (!email || !password) {
      onError?.('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await signInWithEmail(email, password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          onError?.('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          onError?.('Please check your email and click the confirmation link')
        } else {
          onError?.(error.message)
        }
      } else {
        onSuccess?.()
      }
    } catch (error) {
      onError?.('Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      onError?.('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        onError?.(error.message)
      } else {
        setResetSent(true)
      }
    } catch (error) {
      onError?.('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (resetSent) {
    return (
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
        <p className="text-gray-400 mb-4">
          We've sent a password reset link to {email}
        </p>
        <button
          type="button"
          onClick={() => {
            setResetMode(false)
            setResetSent(false)
          }}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter your email"
          required
        />
      </div>

      {!resetMode && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your password"
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : resetMode ? (
          'Send reset email'
        ) : (
          'Sign in'
        )}
      </button>

      <div className="text-center space-y-3">
        {!resetMode ? (
          <>
            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Forgot your password?
            </button>
            
            {onSwitchToSignUp && (
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setResetMode(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Back to sign in
          </button>
        )}
      </div>
    </form>
  )
}