'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, UserProfile, getUserProfile, createUserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) return

    try {
      let userProfile = await getUserProfile(user.id)
      
      if (!userProfile) {
        userProfile = await createUserProfile(user.id, {
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
          trade_focus: null,
          experience_level: null
        })
      }
      
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        await refreshProfile()
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (session?.user) {
          await refreshProfile()
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [user?.id])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut: handleSignOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}