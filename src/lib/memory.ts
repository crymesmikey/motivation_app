import { supabase } from './supabase'
import type { UserProfile, Message, MemorySummary } from './supabase'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function getRecentMessages(userId: string, limit: number = 10): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data.reverse() // Return in chronological order
}

export async function saveMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      role,
      content,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  return data
}

export async function getMemorySummary(userId: string): Promise<MemorySummary | null> {
  const { data, error } = await supabase
    .from('memory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching memory summary:', error)
  }

  return data || null
}

export async function saveMemorySummary(userId: string, summary: string, messagesCount: number): Promise<void> {
  const { error } = await supabase
    .from('memory')
    .insert({
      user_id: userId,
      summary,
      messages_count: messagesCount,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving memory summary:', error)
  }
}