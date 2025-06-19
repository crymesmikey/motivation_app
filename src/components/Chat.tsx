import { useState, useEffect, useRef } from 'react'
import { Send, Heart, User, Bot, Loader2, Menu, Settings, MessageCircle, Sparkles } from 'lucide-react'
import type { Message } from '../lib/supabase'
import { getUserProfile, getRecentMessages, saveMessage, getMemorySummary, saveMemorySummary } from '../lib/memory'
import { buildSystemPrompt, buildMemorySummary } from '../lib/prompts'
import { generateCoachResponse } from '../lib/openai'

interface ChatProps {
  userId: string
}

export default function Chat({ userId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadMessages()
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const loadMessages = async () => {
    try {
      const existingMessages = await getRecentMessages(userId, 50)
      setMessages(existingMessages)

      // Send welcome message if this is the first visit
      if (existingMessages.length === 0) {
        setTimeout(() => {
          sendWelcomeMessage()
        }, 1000)
      } else {
        setShowWelcome(false)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendWelcomeMessage = async () => {
    try {
      setShowWelcome(false)
      const profile = await getUserProfile(userId)
      if (!profile) return

      const systemPrompt = buildSystemPrompt(profile, null, [])
      const welcomeMessage = "Hi there! I'm excited to start this journey with you as your personal MotivCoach."

      const aiResponse = await generateCoachResponse(systemPrompt, welcomeMessage)

      const assistantMessage = await saveMessage(userId, 'assistant', aiResponse)

      if (assistantMessage) {
        setMessages([assistantMessage])
      }
    } catch (error) {
      console.error('Error sending welcome message:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: 'temp-' + Date.now(),
      user_id: userId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      // Get user profile and context
      const profile = await getUserProfile(userId)
      if (!profile) throw new Error('User profile not found')

      const [recentMessages, memorySummary] = await Promise.all([
        getRecentMessages(userId, 10),
        getMemorySummary(userId)
      ])

      // Build system prompt and generate response
      const systemPrompt = buildSystemPrompt(profile, memorySummary, recentMessages)
      const aiResponse = await generateCoachResponse(systemPrompt, userMessage)

      // Save both messages to database
      const [savedUserMessage, savedAssistantMessage] = await Promise.all([
        saveMessage(userId, 'user', userMessage),
        saveMessage(userId, 'assistant', aiResponse)
      ])

      if (savedUserMessage && savedAssistantMessage) {
        // Replace temp message with actual saved messages
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMessage.id),
          savedUserMessage,
          savedAssistantMessage
        ])

        // Check if we need to create/update memory summary
        const totalMessages = recentMessages.length + 2
        if (totalMessages > 20 && (!memorySummary || memorySummary.messages_count < totalMessages - 10)) {
          const allMessages = [...recentMessages, savedUserMessage, savedAssistantMessage]
          const summary = buildMemorySummary(allMessages)
          await saveMemorySummary(userId, summary, totalMessages)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MotivCoach</h1>
                <p className="text-sm text-gray-600">Your Personal AI Life Coach</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
                <Menu className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-88px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-2xl inline-block mb-6">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to MotivCoach!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I'm here to support you on your journey. Share what's on your mind, and let's work together towards your goals.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white shadow-md text-gray-900 border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="bg-gray-400 p-3 rounded-xl flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-4 justify-start">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white shadow-md px-6 py-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-sm text-gray-600">MotivCoach is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                ref={textareaRef}
                placeholder="Share what's on your mind..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50 transition-all duration-200"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}