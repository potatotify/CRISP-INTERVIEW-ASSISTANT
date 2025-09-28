'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, User, CheckCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCandidateAsync, setCurrentCandidate } from '@/store/candidateSlice'
import ResumeUpload from '@/components/ResumeUpload'
import InterviewChat from '@/components/InterviewChat'

// Import the Candidate type from your store
import type { Candidate } from '@/store/candidateSlice'

// Update interface to match your actual Candidate type
interface IntervieweeState {
  appState: 'upload' | 'interview' | 'completed'
  candidateData: Candidate | null  // Use the actual Candidate type
  interviewResult: any | null
}

export default function IntervieweePage() {
  const dispatch = useAppDispatch()
  const { currentCandidate, loading } = useAppSelector((state) => state.candidates)
  
  const [appState, setAppState] = useState<'upload' | 'interview' | 'completed'>('upload')
  const [interviewResult, setInterviewResult] = useState<any>(null)
  
  // Persistence key for overall interview state
  const intervieweeStateKey = 'interviewee_app_state'

  // Restore overall state on mount
  useEffect(() => {
    restoreIntervieweeState()
  }, [])

  // Save state when it changes
  useEffect(() => {
    saveIntervieweeState()
  }, [appState, currentCandidate, interviewResult])

  const saveIntervieweeState = () => {
    try {
      const state: IntervieweeState = {
        appState,
        candidateData: currentCandidate, // This should now work
        interviewResult
      }
      localStorage.setItem(intervieweeStateKey, JSON.stringify(state))
      console.log('🔄 Interviewee state saved:', appState)
    } catch (error) {
      console.error('❌ Failed to save interviewee state:', error)
    }
  }

  const restoreIntervieweeState = () => {
    try {
      const savedState = localStorage.getItem(intervieweeStateKey)
      
      if (savedState) {
        const state: IntervieweeState = JSON.parse(savedState)
        console.log('📱 Restoring interviewee state:', state)
        
        // Only restore if we have candidate data and haven't completed
        if (state.candidateData && state.appState !== 'completed') {
          setAppState(state.appState)
          dispatch(setCurrentCandidate(state.candidateData))
          
          if (state.interviewResult) {
            setInterviewResult(state.interviewResult)
          }
          
          console.log('✅ Interviewee state restored successfully')
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore interviewee state:', error)
    }
  }

  const clearIntervieweeState = () => {
    try {
      localStorage.removeItem(intervieweeStateKey)
      console.log('🗑️ Interviewee state cleared')
    } catch (error) {
      console.error('❌ Failed to clear interviewee state:', error)
    }
  }

  const handleResumeSubmit = async (resumeData: any) => {
  try {
    console.log('📄 Resume submitted:', resumeData)
    
    // STRICT VALIDATION - NO DEFAULTS ALLOWED AT ALL
    const errors = []
    
    if (!resumeData.name || resumeData.name.trim() === '') {
      errors.push('Name is required')
    }
    
    if (!resumeData.email || resumeData.email.trim() === '') {
      errors.push('Email is required')
    }
    
    if (!resumeData.phone || resumeData.phone.trim() === '') {
      errors.push('Phone number is required')
    }
    
    // BLOCK SUBMISSION COMPLETELY if any required fields are missing
    if (errors.length > 0) {
      alert(`❌ Cannot start interview!\n\nMissing required information:\n${errors.map(e => `• ${e}`).join('\n')}\n\nPlease go back and complete all required fields.`)
      return // STOP HERE - DON'T CREATE ANYTHING
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resumeData.email.trim())) {
      alert('❌ Invalid email format. Please provide a valid email address.')
      return
    }
    
    // Phone validation
    const phoneDigits = resumeData.phone.trim().replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      alert('❌ Invalid phone number. Please provide at least 10 digits.')
      return
    }
    
    // ALL VALIDATIONS PASSED - Create candidate with NO default values
    console.log('✅ Creating candidate with validated data:', {
      name: resumeData.name.trim(),
      email: resumeData.email.trim(), 
      phone: resumeData.phone.trim()
    })
    
    const result = await dispatch(addCandidateAsync({
      name: resumeData.name.trim(), 
      email: resumeData.email.trim(),
      phone: resumeData.phone.trim(),
      resume_content: resumeData.text || `Resume processed for ${resumeData.name.trim()}`
    })).unwrap()

    console.log('✅ Candidate created successfully:', result)
    
    // Only proceed to interview if candidate creation was successful
    setAppState('interview')
    
  } catch (error) {
    console.error('❌ Error creating candidate:', error)
    alert('❌ Failed to create candidate profile. Please try again.')
    // DON'T change appState - stay on upload screen
  }

}


  const handleInterviewComplete = (result: any) => {
    console.log('✅ Interview completed:', result)
    setInterviewResult(result)
    setAppState('completed')
    
    // Clear session after completion
    setTimeout(() => {
      clearIntervieweeState()
    }, 1000)
  }

  const handleStartOver = () => {
    clearIntervieweeState()
    setAppState('upload')
    setInterviewResult(null)
    dispatch(setCurrentCandidate(null))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4">Processing...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Upload Resume State
  if (appState === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Technical Interview
            </h1>
            <p className="text-xl text-gray-600">
              Upload your resume to get started with the AI-powered interview
            </p>
          </div>

          
            
            <CardContent>
              <ResumeUpload onParsed={handleResumeSubmit} />
            </CardContent>
          
        </div>
      </div>
    )
  }

  // Interview State
  if (appState === 'interview' && currentCandidate) {
    return (
      <InterviewChat
        candidateName={currentCandidate.name || 'Candidate'}
        resumeContent={currentCandidate.resume_content || 'No resume content available'}
        candidateId={currentCandidate.id}
        onInterviewComplete={handleInterviewComplete}
      />
    )
  }

  // Completed State
  if (appState === 'completed' && interviewResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Interview Completed Successfully!
              </h2>
              
              <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {interviewResult.score}/100
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {interviewResult.answers?.length || 0}/6
                    </div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      {interviewResult.aiEvaluation?.recommendation || 'Processing'}
                    </div>
                    <div className="text-sm text-gray-600">Recommendation</div>
                  </div>
                </div>
                
                <div className="text-left">
                  <h3 className="font-semibold mb-2">AI Summary:</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {interviewResult.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-600">
                  Thank you for completing the technical interview. Your responses have been recorded and will be reviewed by our team.
                </p>
                
                <Button onClick={handleStartOver} variant="outline" size="lg">
                  Take Another Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fallback state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The interview session encountered an error.</p>
            <Button onClick={handleStartOver}>Start Over</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
