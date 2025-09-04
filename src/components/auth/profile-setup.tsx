'use client'

import { useState } from 'react'
import { updateUserProfile, UserProfile } from '@/lib/supabase'
import { useAuth } from './auth-provider'

interface ProfileSetupProps {
  onComplete: () => void
  onSkip?: () => void
}

const TRADE_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'general', label: 'General Construction', icon: '🏗️' }
] as const

const EXPERIENCE_OPTIONS = [
  { 
    value: 'apprentice', 
    label: 'Apprentice', 
    description: 'Just starting out, learning the basics' 
  },
  { 
    value: 'journeyman', 
    label: 'Journeyman', 
    description: 'Licensed tradesperson with experience' 
  },
  { 
    value: 'master', 
    label: 'Master', 
    description: 'Expert level, can train others' 
  }
] as const

export function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.display_name || '')
  const [tradeFocus, setTradeFocus] = useState<UserProfile['trade_focus']>(profile?.trade_focus || null)
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experience_level']>(profile?.experience_level || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await updateUserProfile(user.id, {
        display_name: displayName || null,
        trade_focus: tradeFocus,
        experience_level: experienceLevel
      })
      
      await refreshProfile()
      onComplete()
    } catch (error) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Complete Your Profile</h2>
        <p className="text-gray-400 text-lg">
          Help us personalize your learning experience for the trades industry
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="displayName" className="block text-lg font-semibold text-white mb-4">
            What should we call you?
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="Enter your preferred name"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-white mb-4">
            What's your trade focus?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRADE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTradeFocus(option.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  tradeFocus === option.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-semibold">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-white mb-4">
            What's your experience level?
          </label>
          <div className="space-y-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExperienceLevel(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  experienceLevel === option.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{option.label}</div>
                    <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    experienceLevel === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-500'
                  }`}>
                    {experienceLevel === option.value && (
                      <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-semibold rounded-lg transition-all duration-200"
            >
              Skip for now
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Complete Setup'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}