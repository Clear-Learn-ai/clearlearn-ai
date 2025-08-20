import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
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