import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronRight, Heart, Target, CheckCircle } from 'lucide-react'

const questions = [
  {
    id: 'tone',
    question: 'How do you prefer to receive feedback and motivation?',
    options: [
      { value: 'gentle', label: 'Gentle & Supportive', description: 'Encouraging words and positive reinforcement' },
      { value: 'tough-love', label: 'Direct & Challenging', description: 'Firm guidance that pushes me to action' },
      { value: 'logical', label: 'Analytical & Structured', description: 'Clear reasoning and practical strategies' }
    ]
  },
  {
    id: 'goal',
    question: 'What\'s your biggest focus area right now?',
    options: [
      { value: 'productivity', label: 'Productivity', description: 'Optimizing time, focus, and output' },
      { value: 'discipline', label: 'Discipline', description: 'Building consistent habits and self-control' },
      { value: 'purpose', label: 'Purpose', description: 'Finding meaning and direction in life' },
      { value: 'confidence', label: 'Confidence', description: 'Building self-esteem and overcoming doubt' }
    ]
  },
  {
    id: 'feedback_style',
    question: 'When you need motivation, what works best?',
    options: [
      { value: 'reminders', label: 'Gentle Reminders', description: 'Subtle nudges about my goals' },
      { value: 'accountability', label: 'Accountability Check-ins', description: 'Regular progress reviews' },
      { value: 'inspiration', label: 'Inspirational Content', description: 'Stories and quotes that inspire action' }
    ]
  },
  {
    id: 'motivation_trigger',
    question: 'What usually gets you back on track when you\'re stuck?',
    options: [
      { value: 'breaking_down', label: 'Breaking Things Down', description: 'Making big tasks feel manageable' },
      { value: 'success_stories', label: 'Success Stories', description: 'Hearing about others who overcame similar challenges' },
      { value: 'future_vision', label: 'Future Vision', description: 'Focusing on the end goal and benefits' }
    ]
  },
  {
    id: 'preferred_format',
    question: 'How do you like to engage with personal development?',
    options: [
      { value: 'conversation', label: 'Conversational', description: 'Back-and-forth dialogue and discussion' },
      { value: 'actionable', label: 'Action-Oriented', description: 'Specific steps and tasks to complete' },
      { value: 'reflective', label: 'Reflective', description: 'Thoughtful questions that make me think deeper' }
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

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
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
      onComplete(userId)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('There was an error saving your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = Object.keys(answers).length === questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-500 p-3 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MotivCoach</h1>
            <p className="text-xl text-gray-600">Your personalized AI coach that learns and grows with you</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {questions[currentQuestion].question}
              </h2>
            </div>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                    answers[questions[currentQuestion].id] === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </div>
                    {answers[questions[currentQuestion].id] === option.value && (
                      <CheckCircle className="w-6 h-6 text-blue-500 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Submit */}
          {isComplete && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
              <div className="text-center mb-6">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Perfect! Here's Your Coaching Profile</h3>
                <p className="text-gray-600">Your personalized MotivCoach is ready to help you succeed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Coaching Style</h4>
                  <p className="text-gray-600 text-sm">
                    {questions[0].options.find(o => o.value === answers.tone)?.label}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Primary Focus</h4>
                  <p className="text-gray-600 text-sm">
                    {questions[1].options.find(o => o.value === answers.goal)?.label}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    Start Your Journey <ChevronRight className="w-6 h-6 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}