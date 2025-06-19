import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronRight, Heart, Target, CheckCircle, Sparkles, Star, Zap } from 'lucide-react'

const questions = [
  {
    id: 'tone',
    question: 'How do you prefer to receive feedback and motivation?',
    subtitle: 'Choose the coaching style that resonates with you',
    icon: <Heart className="w-6 h-6" />,
    options: [
      { 
        value: 'gentle', 
        label: 'Gentle & Supportive', 
        description: 'Encouraging words and positive reinforcement',
        icon: '🌸',
        color: 'from-pink-400 to-rose-400'
      },
      { 
        value: 'tough-love', 
        label: 'Direct & Challenging', 
        description: 'Firm guidance that pushes me to action',
        icon: '⚡',
        color: 'from-orange-400 to-red-400'
      },
      { 
        value: 'logical', 
        label: 'Analytical & Structured', 
        description: 'Clear reasoning and practical strategies',
        icon: '🧠',
        color: 'from-blue-400 to-indigo-400'
      }
    ]
  },
  {
    id: 'goal',
    question: 'What\'s your biggest focus area right now?',
    subtitle: 'Let\'s identify where you want to grow most',
    icon: <Target className="w-6 h-6" />,
    options: [
      { 
        value: 'productivity', 
        label: 'Productivity', 
        description: 'Optimizing time, focus, and output',
        icon: '🚀',
        color: 'from-green-400 to-emerald-400'
      },
      { 
        value: 'discipline', 
        label: 'Discipline', 
        description: 'Building consistent habits and self-control',
        icon: '💪',
        color: 'from-purple-400 to-violet-400'
      },
      { 
        value: 'purpose', 
        label: 'Purpose', 
        description: 'Finding meaning and direction in life',
        icon: '🌟',
        color: 'from-yellow-400 to-orange-400'
      },
      { 
        value: 'confidence', 
        label: 'Confidence', 
        description: 'Building self-esteem and overcoming doubt',
        icon: '✨',
        color: 'from-cyan-400 to-blue-400'
      }
    ]
  },
  {
    id: 'feedback_style',
    question: 'When you need motivation, what works best?',
    subtitle: 'Help us understand your motivational triggers',
    icon: <Zap className="w-6 h-6" />,
    options: [
      { 
        value: 'reminders', 
        label: 'Gentle Reminders', 
        description: 'Subtle nudges about my goals',
        icon: '🔔',
        color: 'from-teal-400 to-cyan-400'
      },
      { 
        value: 'accountability', 
        label: 'Accountability Check-ins', 
        description: 'Regular progress reviews',
        icon: '📊',
        color: 'from-indigo-400 to-purple-400'
      },
      { 
        value: 'inspiration', 
        label: 'Inspirational Content', 
        description: 'Stories and quotes that inspire action',
        icon: '💡',
        color: 'from-amber-400 to-yellow-400'
      }
    ]
  },
  {
    id: 'motivation_trigger',
    question: 'What usually gets you back on track when you\'re stuck?',
    subtitle: 'Understanding your reset button',
    icon: <Star className="w-6 h-6" />,
    options: [
      { 
        value: 'breaking_down', 
        label: 'Breaking Things Down', 
        description: 'Making big tasks feel manageable',
        icon: '🧩',
        color: 'from-emerald-400 to-green-400'
      },
      { 
        value: 'success_stories', 
        label: 'Success Stories', 
        description: 'Hearing about others who overcame similar challenges',
        icon: '🏆',
        color: 'from-orange-400 to-red-400'
      },
      { 
        value: 'future_vision', 
        label: 'Future Vision', 
        description: 'Focusing on the end goal and benefits',
        icon: '🔮',
        color: 'from-violet-400 to-purple-400'
      }
    ]
  },
  {
    id: 'preferred_format',
    question: 'How do you like to engage with personal development?',
    subtitle: 'Your preferred learning and growth style',
    icon: <Sparkles className="w-6 h-6" />,
    options: [
      { 
        value: 'conversation', 
        label: 'Conversational', 
        description: 'Back-and-forth dialogue and discussion',
        icon: '💬',
        color: 'from-pink-400 to-rose-400'
      },
      { 
        value: 'actionable', 
        label: 'Action-Oriented', 
        description: 'Specific steps and tasks to complete',
        icon: '⚡',
        color: 'from-blue-400 to-indigo-400'
      },
      { 
        value: 'reflective', 
        label: 'Reflective', 
        description: 'Thoughtful questions that make me think deeper',
        icon: '🤔',
        color: 'from-teal-400 to-cyan-400'
      }
    ]
  }
]

interface OnboardingProps {
  onComplete: (userId: string) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 400)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const userId = crypto.randomUUID()
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          tone: answers.tone as any,
          goal: answers.goal as any,
          feedback_style: answers.feedback_style,
          motivation_trigger: answers.motivation_trigger,
          preferred_format: answers.preferred_format,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      localStorage.setItem('motivcoach_user_id', userId)
      setShowToast(true)
      setTimeout(() => {
        onComplete(userId)
      }, 1500)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('There was an error saving your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = Object.keys(answers).length === questions.length
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 slide-up">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg p-4 rounded-full pulse-glow">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">MotivCoach</span>
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto leading-relaxed">
              Your personalized AI coach that learns and grows with you. Let's create your unique coaching experience.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between text-sm text-white text-opacity-80 mb-4">
                <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-pink-400 h-3 rounded-full transition-all duration-700 ease-out shimmer"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-3xl p-8 mb-8 slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4">
                {questions[currentQuestion].icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-white text-opacity-70">
                {questions[currentQuestion].subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 group hover:scale-105 btn-hover ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'bg-white bg-opacity-20 ring-2 ring-white ring-opacity-50'
                      : 'bg-white bg-opacity-10 hover:bg-opacity-15'
                  }`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`text-2xl p-3 rounded-xl bg-gradient-to-r ${option.color} bg-opacity-20`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 text-lg group-hover:text-opacity-100">
                          {option.label}
                        </h3>
                        <p className="text-white text-opacity-70 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {answers[questions[currentQuestion].id] === option.value && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="bg-green-400 rounded-full p-1">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Submit */}
          {isComplete && (
            <div className="glass-card rounded-3xl p-8 mb-8 slide-up border-2 border-green-400 border-opacity-30">
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-4 rounded-full">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Perfect! Your Coach is Ready
                </h3>
                <p className="text-white text-opacity-80 text-lg max-w-md mx-auto">
                  Your personalized MotivCoach profile has been created and is ready to help you succeed
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white bg-opacity-10 p-6 rounded-2xl">
                  <h4 className="font-semibold text-white mb-2 text-lg">Coaching Style</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {questions[0].options.find(o => o.value === answers.tone)?.icon}
                    </span>
                    <p className="text-white text-opacity-80">
                      {questions[0].options.find(o => o.value === answers.tone)?.label}
                    </p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 p-6 rounded-2xl">
                  <h4 className="font-semibold text-white mb-2 text-lg">Primary Focus</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {questions[1].options.find(o => o.value === answers.goal)?.icon}
                    </span>
                    <p className="text-white text-opacity-80">
                      {questions[1].options.find(o => o.value === answers.goal)?.label}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white py-6 px-8 rounded-2xl font-semibold text-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl btn-hover transform hover:scale-105"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Creating Your Coach...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6" />
                    <span>Start Your Journey</span>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 slide-up">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Profile saved! Welcome aboard! 🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}
