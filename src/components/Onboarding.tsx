import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronRight, Heart, Target, CheckCircle, Sparkles, Star, Zap, ArrowLeft } from 'lucide-react'

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
        color: 'from-pink-500 to-rose-500'
      },
      { 
        value: 'tough-love', 
        label: 'Direct & Challenging', 
        description: 'Firm guidance that pushes me to action',
        icon: '⚡',
        color: 'from-orange-500 to-red-500'
      },
      { 
        value: 'logical', 
        label: 'Analytical & Structured', 
        description: 'Clear reasoning and practical strategies',
        icon: '🧠',
        color: 'from-blue-500 to-indigo-500'
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
        color: 'from-green-500 to-emerald-500'
      },
      { 
        value: 'discipline', 
        label: 'Discipline', 
        description: 'Building consistent habits and self-control',
        icon: '💪',
        color: 'from-purple-500 to-violet-500'
      },
      { 
        value: 'purpose', 
        label: 'Purpose', 
        description: 'Finding meaning and direction in life',
        icon: '🌟',
        color: 'from-yellow-500 to-orange-500'
      },
      { 
        value: 'confidence', 
        label: 'Confidence', 
        description: 'Building self-esteem and overcoming doubt',
        icon: '✨',
        color: 'from-cyan-500 to-blue-500'
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
        color: 'from-teal-500 to-cyan-500'
      },
      { 
        value: 'accountability', 
        label: 'Accountability Check-ins', 
        description: 'Regular progress reviews',
        icon: '📊',
        color: 'from-indigo-500 to-purple-500'
      },
      { 
        value: 'inspiration', 
        label: 'Inspirational Content', 
        description: 'Stories and quotes that inspire action',
        icon: '💡',
        color: 'from-amber-500 to-yellow-500'
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
        color: 'from-emerald-500 to-green-500'
      },
      { 
        value: 'success_stories', 
        label: 'Success Stories', 
        description: 'Hearing about others who overcame similar challenges',
        icon: '🏆',
        color: 'from-orange-500 to-red-500'
      },
      { 
        value: 'future_vision', 
        label: 'Future Vision', 
        description: 'Focusing on the end goal and benefits',
        icon: '🔮',
        color: 'from-violet-500 to-purple-500'
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
        color: 'from-pink-500 to-rose-500'
      },
      { 
        value: 'actionable', 
        label: 'Action-Oriented', 
        description: 'Specific steps and tasks to complete',
        icon: '⚡',
        color: 'from-blue-500 to-indigo-500'
      },
      { 
        value: 'reflective', 
        label: 'Reflective', 
        description: 'Thoughtful questions that make me think deeper',
        icon: '🤔',
        color: 'from-teal-500 to-cyan-500'
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="hero-gradient">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl">
                  <Heart className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">MotivCoach</span>
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto leading-relaxed">
              Your personalized AI coach that learns and grows with you. Let's create your unique coaching experience in just a few minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span className="font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="font-semibold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-10 mb-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-6 text-white">
                {questions[currentQuestion].icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-lg text-gray-600">
                {questions[currentQuestion].subtitle}
              </p>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                  className={`w-full text-left p-6 rounded-xl transition-all duration-300 group hover:shadow-lg ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${option.color} text-white`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                          {option.label}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {answers[questions[currentQuestion].id] === option.value && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="bg-indigo-500 rounded-full p-1">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index <= currentQuestion ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          {isComplete && (
            <div className="bg-white rounded-2xl shadow-lg p-10 border-2 border-green-200">
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white">
                    <Target className="w-12 h-12" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-4">
                  Perfect! Your Coach is Ready
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Your personalized MotivCoach profile has been created and is ready to help you succeed on your journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Coaching Style</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {questions[0].options.find(o => o.value === answers.tone)?.icon}
                    </span>
                    <p className="text-gray-700 font-medium">
                      {questions[0].options.find(o => o.value === answers.tone)?.label}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Primary Focus</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {questions[1].options.find(o => o.value === answers.goal)?.icon}
                    </span>
                    <p className="text-gray-700 font-medium">
                      {questions[1].options.find(o => o.value === answers.goal)?.label}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 px-8 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 slide-up">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Profile saved! Welcome aboard! 🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}