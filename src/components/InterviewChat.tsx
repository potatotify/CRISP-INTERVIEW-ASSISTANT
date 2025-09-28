'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Send, CheckCircle } from 'lucide-react'
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
  candidateId: string // Add this line
  onInterviewComplete: (result: InterviewResult) => void
}

interface InterviewResult {
  score: number
  summary: string
  answers: { question: string; answer: string; timeSpent: number }[]
  aiEvaluation?: any // Full AI evaluation details
}

export default function InterviewChat({ candidateName, resumeContent,candidateId, onInterviewComplete }: InterviewChatProps) {
  const dispatch = useAppDispatch()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState<{ question: string; answer: string; timeSpent: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Generate questions on mount
  useEffect(() => {
    generateQuestions()
  }, [])

  // Timer effect
  // Timer effect
useEffect(() => {
  if (interviewStarted && !interviewCompleted && timeLeft > 0) {
    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
  } else if (timeLeft === 0 && interviewStarted && !interviewCompleted) {
    handleSubmitAnswer(true) // Auto-submit when time runs out
  }

  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }
}, [timeLeft, interviewStarted, interviewCompleted])


  const generateQuestions = async () => {
    setLoading(true)
    
    // Predefined questions for Full Stack React/Node role
    const fullStackQuestions: Question[] = [
      // 2 Easy Questions (20s each)
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
      // 2 Medium Questions (60s each)
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
      // 2 Hard Questions (120s each)
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

  const startInterview = () => {
    setInterviewStarted(true)
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
    
    // Save answer
    const newAnswer = {
      question: currentQuestion.question,
      answer: autoSubmit ? (currentAnswer || 'No answer provided (time ran out)') : currentAnswer,
      timeSpent: timeSpent
    }
    
    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Check if this was the last question
    if (currentQuestionIndex === questions.length - 1) {
      // Interview completed - calculate results
      await calculateFinalResults(updatedAnswers)
    } else {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      startQuestion(nextIndex)
    }
  }

 const calculateFinalResults = async (finalAnswers: typeof answers) => {
  setInterviewCompleted(true)
  
  console.log('=== STARTING INTERVIEW EVALUATION ===')
  console.log('Candidate ID:', candidateId)
  console.log('Candidate Name:', candidateName)
  console.log('Final Answers:', finalAnswers)
  
  try {
    console.log('Step 1: Calling AI evaluation...')
    
    const response = await fetch('/api/evaluate-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: finalAnswers,
        candidateName,
        resumeContent
      })
    })

    console.log('AI Response Status:', response.status)

    if (response.ok) {
      const aiEvaluation = await response.json()
      console.log('AI Evaluation Result:', aiEvaluation)
      
      if (aiEvaluation.error) {
        throw new Error(aiEvaluation.error)
      }

      const interviewResult = {
        score: aiEvaluation.overallScore,
        summary: aiEvaluation.summary,
        answers: finalAnswers,
        aiEvaluation,
        completedAt: new Date().toISOString(),
        recommendation: aiEvaluation.recommendation || 'No Hire'
      }

      console.log('Step 2: Prepared interview result:', interviewResult)

      // Save interview results to database
      console.log('Step 3: Saving to database...')
      console.log('API URL:', `/api/candidates/${candidateId}/results`)
      
      const saveResponse = await fetch(`/api/candidates/${candidateId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewResult)
      })

      console.log('Save Response Status:', saveResponse.status)
      const saveResponseText = await saveResponse.text()
      console.log('Save Response Text:', saveResponseText)

      if (saveResponse.ok) {
        console.log('✅ Interview results saved successfully!')
      } else {
        console.error('❌ Failed to save interview results')
      }

      onInterviewComplete(interviewResult)
      
    } else {
      throw new Error(`AI evaluation failed with status: ${response.status}`)
    }
    
  } catch (error) {
    console.error('❌ Interview evaluation error:', error)
    
    // Create fallback result
    const fallbackResult = {
      score: 0,
      summary: `Interview could not be evaluated. Error: ${error}`,
      answers: finalAnswers,
      completedAt: new Date().toISOString(),
      recommendation: 'No Hire' as const,
      aiEvaluation: { error: 'AI evaluation failed', details: error }
    }

    console.log('Step 4: Saving fallback result...')

    // Try to save fallback result
    try {
      const fallbackSaveResponse = await fetch(`/api/candidates/${candidateId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackResult)
      })

      if (fallbackSaveResponse.ok) {
        console.log('✅ Fallback results saved')
      } else {
        console.error('❌ Failed to save fallback results')
      }
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
                <li>• Final score and summary at the end</li>
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
