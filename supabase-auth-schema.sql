-- TradeAI Tutor Authentication and User Profile Schema
-- This file contains the database schema and Row Level Security policies
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  trade_focus TEXT CHECK (trade_focus IN ('plumbing', 'electrical', 'hvac', 'general')),
  experience_level TEXT CHECK (experience_level IN ('apprentice', 'journeyman', 'master')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for user_profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Update existing chat_sessions table to ensure proper RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id::uuid);

-- Update existing messages table to ensure proper RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their sessions" ON public.messages;

-- Create RLS policies for messages
CREATE POLICY "Users can view messages from their sessions" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND auth.uid() = chat_sessions.user_id::uuid
    )
  );

CREATE POLICY "Users can create messages in their sessions" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND auth.uid() = chat_sessions.user_id::uuid
    )
  );

CREATE POLICY "Users can update messages in their sessions" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND auth.uid() = chat_sessions.user_id::uuid
    )
  );

CREATE POLICY "Users can delete messages in their sessions" ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND auth.uid() = chat_sessions.user_id::uuid
    )
  );

-- Create learning_analytics table for tracking user progress
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  trade_area TEXT,
  engagement_time INTEGER DEFAULT 0, -- seconds spent
  questions_asked INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
  difficulty_level TEXT CHECK (difficulty_level IN ('apprentice', 'journeyman', 'master')),
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for learning_analytics
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for learning_analytics
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON public.learning_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics" ON public.learning_analytics
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for learning_analytics
CREATE TRIGGER learning_analytics_updated_at
  BEFORE UPDATE ON public.learning_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_trade_focus ON public.user_profiles(trade_focus);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_level ON public.user_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON public.learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_topic ON public.learning_analytics(topic);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_trade_area ON public.learning_analytics(trade_area);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.learning_analytics TO authenticated;
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT ALL ON public.messages TO authenticated;