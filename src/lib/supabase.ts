import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database Types
export interface UserProfile {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  trade_focus: 'plumbing' | 'electrical' | 'hvac' | 'general' | null
  experience_level: 'apprentice' | 'journeyman' | 'master' | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  subscription_tier?: 'free' | 'pro' | 'team'
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  video_results?: any[]
}

export interface UserAnalytics {
  id: string
  user_id: string
  topic: string
  engagement_time: number
  completion_rate: number
  created_at: string
}

// Database Functions
export async function createChatSession(userId: string, title: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([
      { user_id: userId, title, updated_at: new Date().toISOString() }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChatSessions(userId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string, videoResults?: any[]) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { 
        session_id: sessionId, 
        role, 
        content,
        video_results: videoResults,
        timestamp: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMessages(sessionId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data
}

// Auth Functions
export async function signUpWithEmail(email: string, password: string, metadata?: { displayName?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  return { data, error }
}

// User Profile Functions
export async function createUserProfile(userId: string, profile: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      user_id: userId,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      trade_focus: profile.trade_focus,
      experience_level: profile.experience_level,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}