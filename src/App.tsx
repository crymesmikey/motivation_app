import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import Chat from './components/Chat'

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUserId = localStorage.getItem('motivcoach_user_id')
    setUserId(storedUserId)
    setIsLoading(false)
  }, [])

  const handleOnboardingComplete = (newUserId: string) => {
    setUserId(newUserId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MotivCoach...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <Chat userId={userId} />
}

export default App