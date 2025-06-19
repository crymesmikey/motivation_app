import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string
  tone: 'gentle' | 'tough-love' | 'logical'
  goal: 'productivity' | 'discipline' | 'purpose' | 'confidence'
  feedback_style: string
  motivation_trigger: string
  preferred_format: string
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface MemorySummary {
  id: string
  user_id: string
  summary: string
  created_at: string
  messages_count: number
}