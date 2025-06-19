import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronRight, Heart, Target, CheckCircle, Sparkles, Star, Zap, ArrowLeft, Users } from 'lucide-react'

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
      }, 600)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
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
      }, 2000)
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
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 hero-gradient">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="glass p-8 rounded-3xl">
                  <Heart className="w-20 h-20 text-purple-600" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-7xl font-bold text-white mb-8 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                MotivCoach
              </span>
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Your personalized AI coach that adapts to your unique style and goals.{' '}
              <span className="font-semibold text-yellow-300">Join 10,000+ people</span>{' '}
              transforming their lives with personalized coaching.
            </p>
            
            {/* Social proof */}
            <div className="flex items-center justify-center mt-8 space-x-6">
              <div className="flex items-center space-x-2 text-white/80">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="glass-card p-8 mb-8 rounded-3xl">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
              <span className="font-semibold text-lg">Step {currentQuestion + 1} of {questions.length}</span>
              <span className="font-semibold text-lg">{Math.round(progress)}% Complete</span>
            </div>
            <div className="progress-bar h-4">
              <div 
                className="progress-fill h-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-card p-12 mb-8 rounded-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl mb-8 text-white glow-purple">
                {questions[currentQuestion].icon}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {questions[currentQuestion].subtitle}
              </p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                  className={`card-option w-full text-left p-8 transition-all duration-500 group ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'selected'
                      : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className={`text-4xl p-4 rounded-2xl bg-gradient-to-r ${option.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-3 text-xl">
                          {option.label}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {answers[questions[currentQuestion].id] === option.value && (
                      <div className="ml-6 flex-shrink-0">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2 shadow-lg">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="btn-ghost flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex space-x-3">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index <= currentQuestion 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-110' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          {isComplete && (
            <div className="glass-card p-12 rounded-3xl border-2 border-green-200 glow-purple">
              <div className="text-center mb-10">
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 rounded-3xl text-white shadow-2xl">
                    <Target className="w-16 h-16" />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-gray-800 mb-6">
                  Perfect! Your Coach is Ready
                </h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Your personalized MotivCoach profile has been created and is ready to help you succeed on your journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                  <h4 className="font-bold text-gray-800 mb-4 text-xl">Coaching Style</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">
                      {questions[0].options.find(o => o.value === answers.tone)?.icon}
                    </span>
                    <p className="text-gray-700 font-semibold text-lg">
                      {questions[0].options.find(o => o.value === answers.tone)?.label}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
                  <h4 className="font-bold text-gray-800 mb-4 text-xl">Primary Focus</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">
                      {questions[1].options.find(o => o.value === answers.goal)?.icon}
                    </span>
                    <p className="text-gray-700 font-semibold text-lg">
                      {questions[1].options.find(o => o.value === answers.goal)?.label}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary w-full py-6 px-10 text-xl font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl glow-purple"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-4">
                    <div className="loading-dots">
                      <div className="loading-dot bg-white"></div>
                      <div className="loading-dot bg-white"></div>
                      <div className="loading-dot bg-white"></div>
                    </div>
                    <span>Creating Your Personal Coach...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Sparkles className="w-8 h-8" />
                    <span>Start Your Transformation Journey</span>
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="glass-card bg-green-500 text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center space-x-4" style={{animation: 'slideInRight 0.6s ease-out'}}>
            <CheckCircle className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">Welcome aboard!</p>
              <p className="text-green-100">Your coach is ready to help you succeed 🎉</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}