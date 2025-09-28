'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Send, CheckCircle, RotateCcw } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { saveInterviewResultAsync } from '@/store/candidateSlice'

interface Question {
  id: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
}

interface InterviewChatProps {
  candidateName: string
  resumeContent: string
  candidateId: string
  onInterviewComplete: (result: InterviewResult) => void
}

interface InterviewResult {
  score: number
  summary: string
  answers: { question: string; answer: string; timeSpent: number }[]
  aiEvaluation?: any
}

interface InterviewSession {
  candidateId: string
  candidateName: string
  currentQuestionIndex: number
  questions: Question[]
  currentAnswer: string
  timeLeft: number
  answers: { question: string; answer: string; timeSpent: number }[]
  interviewStarted: boolean
  interviewCompleted: boolean
  exitedFullscreen: boolean
  startedAt: string
  lastActiveAt: string
  questionStartTime: number
}

export default function InterviewChat({ 
  candidateName, 
  resumeContent, 
  candidateId, 
  onInterviewComplete 
}: InterviewChatProps) {
  const dispatch = useAppDispatch()
  
  // Core interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState<{ question: string; answer: string; timeSpent: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  const [exitedFullscreen, setExitedFullscreen] = useState(false)
  
  // Persistence state
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [sessionRestored, setSessionRestored] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const sessionKey = `interview_session_${candidateId}`

  // Auto-save interval
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Generate questions on mount
  useEffect(() => {
    generateQuestions()
  }, [])

  // Restore session on mount
  useEffect(() => {
    restoreSession()
  }, [])

  // Auto-save every 5 seconds during interview
  useEffect(() => {
    if (interviewStarted && !interviewCompleted) {
      autoSaveRef.current = setInterval(() => {
        saveSession()
      }, 5000)
    } else {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current)
      }
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current)
      }
    }
  }, [interviewStarted, interviewCompleted])

  // Save session on state changes
  useEffect(() => {
    if (sessionRestored && interviewStarted && !interviewCompleted) {
      saveSession()
    }
  }, [
    currentQuestionIndex, 
    currentAnswer, 
    timeLeft, 
    answers, 
    exitedFullscreen,
    sessionRestored,
    interviewStarted,
    interviewCompleted
  ])

  // Clear session when interview completes
  useEffect(() => {
    if (interviewCompleted) {
      clearSession()
    }
  }, [interviewCompleted])

  // Listen for fullscreen exit
  useEffect(() => {
    if (!interviewStarted || interviewCompleted) return

    const handleFullscreenChange = () => {
      if (typeof document !== 'undefined' && !document.fullscreenElement) {
        setExitedFullscreen(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [interviewStarted, interviewCompleted])

  // Listen for page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (interviewStarted && !interviewCompleted) {
        saveSession()
        e.preventDefault()
        e.returnValue = 'You have an active interview. Are you sure you want to leave?'
        return 'You have an active interview. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [interviewStarted, interviewCompleted])

  // Timer effect
  useEffect(() => {
    if (interviewStarted && !interviewCompleted && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && interviewStarted && !interviewCompleted) {
      handleSubmitAnswer(true)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, interviewStarted, interviewCompleted])

  const generateQuestions = async () => {
    setLoading(true)
    
    const fullStackQuestions: Question[] = [
      {
        id: '1',
        question: 'What does JSX stand for?',
        difficulty: 'easy',
        timeLimit: 20
      },
      {
        id: '2', 
        question: 'Explain the difference between npm and yarn package managers.',
        difficulty: 'easy',
        timeLimit: 20
      },
      {
        id: '3',
        question: 'How would you implement user authentication in a React/Node.js application? Describe the flow.',
        difficulty: 'medium',
        timeLimit: 60
      },
      {
        id: '4',
        question: 'Explain React hooks like useState and useEffect. When would you use each?',
        difficulty: 'medium', 
        timeLimit: 60
      },
      {
        id: '5',
        question: 'Design a real-time chat application architecture using React and Node.js. What technologies would you use and why?',
        difficulty: 'hard',
        timeLimit: 120
      },
      {
        id: '6',
        question: 'How would you optimize a React application for performance? Explain lazy loading, memoization, and other techniques.',
        difficulty: 'hard',
        timeLimit: 120
      }
    ]

    setQuestions(fullStackQuestions)
    setLoading(false)
  }

  const saveSession = () => {
    try {
      const sessionData: InterviewSession = {
        candidateId,
        candidateName,
        currentQuestionIndex,
        questions,
        currentAnswer,
        timeLeft,
        answers,
        interviewStarted,
        interviewCompleted,
        exitedFullscreen,
        startedAt: startTimeRef.current.toString(),
        lastActiveAt: Date.now().toString(),
        questionStartTime: startTimeRef.current
      }

      localStorage.setItem(sessionKey, JSON.stringify(sessionData))
      console.log('✅ Session saved successfully')
    } catch (error) {
      console.error('❌ Failed to save session:', error)
    }
  }

  const restoreSession = () => {
    try {
      const savedSession = localStorage.getItem(sessionKey)
      
      if (savedSession) {
        const sessionData: InterviewSession = JSON.parse(savedSession)
        
        // Check if session is not too old (24 hours)
        const lastActive = parseInt(sessionData.lastActiveAt)
        const now = Date.now()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (now - lastActive > maxAge) {
          console.log('Session expired, clearing...')
          clearSession()
          return
        }

        // Only restore if interview was not completed
        if (!sessionData.interviewCompleted && sessionData.interviewStarted) {
          console.log('📱 Restoring interview session...')
          
          setCurrentQuestionIndex(sessionData.currentQuestionIndex)
          setQuestions(sessionData.questions)
          setCurrentAnswer(sessionData.currentAnswer)
          setTimeLeft(sessionData.timeLeft)
          setAnswers(sessionData.answers)
          setInterviewStarted(sessionData.interviewStarted)
          setExitedFullscreen(sessionData.exitedFullscreen)
          startTimeRef.current = sessionData.questionStartTime
          
          setShowWelcomeBack(true)
          setSessionRestored(true)
          
          console.log('✅ Session restored successfully')
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore session:', error)
      clearSession()
    }
  }

  const clearSession = () => {
    try {
      localStorage.removeItem(sessionKey)
      console.log('🗑️ Session cleared')
    } catch (error) {
      console.error('❌ Failed to clear session:', error)
    }
  }

  const handleContinueSession = () => {
    setShowWelcomeBack(false)
    // Re-enter fullscreen if needed
    if (typeof document !== 'undefined') {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }
    }
  }

  const handleRestartInterview = () => {
    clearSession()
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setTimeLeft(0)
    setAnswers([])
    setInterviewStarted(false)
    setInterviewCompleted(false)
    setExitedFullscreen(false)
    setShowWelcomeBack(false)
    setSessionRestored(false)
  }

  const startInterview = () => {
    // Request fullscreen
    if (typeof document !== 'undefined') {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen()
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen()
      }
    }
    
    setInterviewStarted(true)
    setSessionRestored(true)
    startQuestion(0)
  }

  const startQuestion = (questionIndex: number) => {
    const question = questions[questionIndex]
    setTimeLeft(question.timeLimit)
    setCurrentAnswer('')
    startTimeRef.current = Date.now()
  }

  const handleSubmitAnswer = async (autoSubmit = false) => {
    const currentQuestion = questions[currentQuestionIndex]
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    const newAnswer = {
      question: currentQuestion.question,
      answer: autoSubmit ? (currentAnswer || 'No answer provided (time ran out)') : currentAnswer,
      timeSpent: timeSpent
    }
    
    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    if (currentQuestionIndex === questions.length - 1) {
      await calculateFinalResults(updatedAnswers)
    } else {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      startQuestion(nextIndex)
    }
  }

  const calculateFinalResults = async (finalAnswers: typeof answers) => {
    setInterviewCompleted(true)
    // Exit fullscreen only if currently in fullscreen
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { // Safari
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { // IE11
          (document as any).msExitFullscreen();
        }
      } catch (e) {
        // Ignore error if document is not active or fullscreen already exited
      }
    }
    
    console.log('=== STARTING INTERVIEW EVALUATION ===')
    
    try {
      const response = await fetch('/api/evaluate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          candidateName,
          resumeContent
        })
      })

      if (response.ok) {
        const aiEvaluation = await response.json()
        
        if (aiEvaluation.error) {
          throw new Error(aiEvaluation.error)
        }

        let summary = aiEvaluation.summary
        if (exitedFullscreen) {
          summary += '\n\n⚠️ Warning: Candidate exited fullscreen during the interview.'
        }

        const interviewResult = {
          score: aiEvaluation.overallScore,
          summary,
          answers: finalAnswers,
          aiEvaluation,
          completedAt: new Date().toISOString(),
          recommendation: aiEvaluation.recommendation || 'No Hire'
        }

        // Save to database
        const saveResponse = await fetch(`/api/candidates/${candidateId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interviewResult)
        })

        if (saveResponse.ok) {
          console.log('✅ Interview results saved successfully!')
        }

        onInterviewComplete(interviewResult)
        
      } else {
        throw new Error(`AI evaluation failed with status: ${response.status}`)
      }
      
    } catch (error) {
      console.error('❌ Interview evaluation error:', error)
      
      let summary = `Interview could not be evaluated. Error: ${error}`
      if (exitedFullscreen) {
        summary += '\n\n⚠️ Warning: Candidate exited fullscreen during the interview.'
      }

      const fallbackResult = {
        score: 0,
        summary,
        answers: finalAnswers,
        completedAt: new Date().toISOString(),
        recommendation: 'No Hire' as const,
        aiEvaluation: { error: 'AI evaluation failed', details: error }
      }

      try {
        await fetch(`/api/candidates/${candidateId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackResult)
        })
        console.log('✅ Fallback results saved')
      } catch (saveError) {
        console.error('❌ Error saving fallback results:', saveError)
      }

      onInterviewComplete(fallbackResult)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4">Preparing interview questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Welcome Back Modal
  if (showWelcomeBack) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-blue-500">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <RotateCcw className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-600">Welcome Back, {candidateName}!</CardTitle>
            <p className="text-gray-600 mt-2">
              We found your unfinished interview session. You can continue where you left off.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Session Details:</h3>
              <ul className="text-sm space-y-1">
                <li>• Progress: Question {currentQuestionIndex + 1} of {questions.length}</li>
                <li>• Answers completed: {answers.length}</li>
                <li>• Time remaining: {formatTime(timeLeft)}</li>
                <li>• {exitedFullscreen ? '⚠️ Previously exited fullscreen' : '✅ Fullscreen maintained'}</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleContinueSession} 
                className="flex-1"
                size="lg"
              >
                Continue Interview
              </Button>
              <Button 
                onClick={handleRestartInterview} 
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!interviewStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Full Stack React/Node.js Interview</CardTitle>
            <p className="text-gray-600">Ready to start your technical interview, {candidateName}?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interview Format:</h3>
              <ul className="text-sm space-y-1">
                <li>• 6 questions total: 2 Easy → 2 Medium → 2 Hard</li>
                <li>• Time limits: Easy (20s), Medium (60s), Hard (120s)</li>
                <li>• Questions shown one at a time</li>
                <li>• Auto-submit when time runs out</li>
                <li>• Progress is automatically saved</li>
                <li>• You can resume if interrupted</li>
                <li>• Please remain in fullscreen mode</li>
              </ul>
            </div>
            
            <Button onClick={startInterview} className="w-full" size="lg">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (interviewCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Interview Completed!</h2>
            <p>Results are being calculated...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto p-6">
      

      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Badge variant={currentQuestion.difficulty === 'easy' ? 'secondary' : 
                              currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'}>
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={timeLeft === 0}
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
            />
            
            <Button 
              onClick={() => handleSubmitAnswer()} 
              disabled={!currentAnswer.trim() || timeLeft === 0}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
