'use client'

import { useState } from 'react'
import { signUpWithEmail } from '@/lib/supabase'

interface SignupFormProps {
  onSuccess?: () => void
  onError?: (_error: string) => void
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSuccess, onError, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpComplete, setSignUpComplete] = useState(false)

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long'
    }
    if (!hasUppercase || !hasLowercase) {
      return 'Password must contain both uppercase and lowercase letters'
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number'
    }
    if (!hasSpecial) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!email || !password || !confirmPassword) {
      onError?.('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      onError?.('Passwords do not match')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      onError?.(passwordError)
      return
    }

    setLoading(true)
    try {
      const { error } = await signUpWithEmail(email, password, {
        displayName: displayName || email.split('@')[0]
      })
      
      if (error) {
        if (error.message.includes('User already registered')) {
          onError?.('An account with this email already exists')
        } else {
          onError?.(error.message)
        }
      } else {
        setSignUpComplete(true)
      }
    } catch (error) {
      onError?.('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (signUpComplete) {
    return (
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
        <p className="text-gray-400 mb-4">
          We've sent you a confirmation link at {email}. Please click the link to verify your account.
        </p>
        {onSwitchToLogin && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Back to sign in
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
          Display name (optional)
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="How should we call you?"
        />
      </div>

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
          placeholder="Create a strong password"
          required
        />
        <div className="mt-2 space-y-1">
          <div className="text-xs text-gray-400">
            Password must contain:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-gray-500'}`} />
              8+ characters
            </div>
            <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-400' : 'bg-gray-500'}`} />
              Upper & lowercase
            </div>
            <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-400' : 'bg-gray-500'}`} />
              Number
            </div>
            <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-400' : 'bg-gray-500'}`} />
              Special character
            </div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Confirm your password"
          required
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Create account'
        )}
      </button>

      <div className="text-center">
        {onSwitchToLogin && (
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </div>
    </form>
  )
}