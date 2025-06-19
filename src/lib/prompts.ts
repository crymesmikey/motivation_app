import type { UserProfile, Message, MemorySummary } from './supabase'

export function buildSystemPrompt(
  profile: UserProfile,
  memorySummary: MemorySummary | null,
  recentMessages: Message[]
): string {
  const toneDescription = {
    gentle: 'supportive and encouraging, using warm language and positive reinforcement',
    'tough-love': 'direct and challenging, pushing the user to take action with firm but caring guidance',
    logical: 'analytical and structured, providing clear reasoning and practical strategies'
  }

  const goalDescription = {
    productivity: 'helping them optimize their time, focus, and output',
    discipline: 'building consistent habits and self-control',
    purpose: 'finding meaning and direction in life',
    confidence: 'building self-esteem and overcoming self-doubt'
  }

  let systemPrompt = `You are MotivCoach, a personalized AI life coach who has been working with this specific user over time. You know their personality, goals, and history.

USER PROFILE:
- Coaching Style: ${profile.tone} (be ${toneDescription[profile.tone]})
- Primary Goal: ${profile.goal} (focus on ${goalDescription[profile.goal]})
- Feedback Preference: ${profile.feedback_style}
- Motivation Trigger: ${profile.motivation_trigger}

`

  if (memorySummary) {
    systemPrompt += `MEMORY SUMMARY (from ${memorySummary.messages_count} past messages):
${memorySummary.summary}

`
  }

  if (recentMessages.length > 0) {
    systemPrompt += `RECENT CONVERSATION:\n`
    recentMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Coach'
      systemPrompt += `${role}: ${msg.content}\n`
    })
    systemPrompt += `\n`
  }

  systemPrompt += `COACHING GUIDELINES:
- Keep responses under 120 words
- Be personal and reference their history when relevant
- Provide actionable advice or thoughtful reflection
- Match their preferred communication style
- Don't repeat previous advice unless building on it
- Be their consistent coach who remembers them

Respond as their dedicated MotivCoach who truly knows and cares about their progress.`

  return systemPrompt
}

export function buildMemorySummary(messages: Message[]): string {
  // This is a simplified version - in production, you might use GPT to generate better summaries
  const userMessages = messages.filter(m => m.role === 'user')
  const themes = new Set<string>()
  
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase()
    if (content.includes('work') || content.includes('job')) themes.add('work/career')
    if (content.includes('habit') || content.includes('routine')) themes.add('habits/routines')
    if (content.includes('goal') || content.includes('achieve')) themes.add('goals/achievements')
    if (content.includes('stress') || content.includes('anxious')) themes.add('stress/anxiety')
    if (content.includes('motivation') || content.includes('inspired')) themes.add('motivation')
  })

  return `User has discussed: ${Array.from(themes).join(', ')}. Recent focus areas and progress patterns from ${messages.length} messages.`
}