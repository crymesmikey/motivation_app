import { useState, useEffect, useRef } from 'react'
import { Send, Heart, User, Bot, Loader2, Sparkles, Menu, Settings } from 'lucide-react'
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
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto h-screen flex flex-col relative z-10">
        {/* Header */}
        <div className="glass-card border-b border-white border-opacity-20 p-4 slide-up">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">MotivCoach</h1>
                <p className="text-sm text-white text-opacity-80">Your Personal AI Life Coach</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <button className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 focus-ring">
                <Menu className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 focus-ring">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 fade-in ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-full">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white shadow-md text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="bg-gray-400 p-2 rounded-full">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start space-x-3 justify-start">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-full">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white shadow-md px-4 py-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">MotivCoach is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    ref={textareaRef}
                    placeholder="Share what's on your mind..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}