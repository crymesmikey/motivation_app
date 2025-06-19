import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function generateCoachResponse(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || "I'm here to support you. Could you share more about what's on your mind?"
  } catch (error) {
    console.error('Error generating coach response:', error)
    return "I'm having trouble connecting right now, but I'm here to support you. Please try again in a moment."
  }
}