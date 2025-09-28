'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCandidateAsync } from '@/store/candidateSlice'
import ResumeUpload from '@/components/ResumeUpload'
import InterviewChat from '@/components/InterviewChat'
import InterviewResults from '@/components/InterviewResults'
import { type ParsedResume } from '@/utils/resumeParser'

interface InterviewResult {
  score: number
  summary: string
  answers: { question: string; answer: string; timeSpent: number }[]
}

type AppState = 'upload' | 'interview' | 'results'

export default function IntervieweePage() {
  const dispatch = useAppDispatch()
  const { currentCandidate, loading } = useAppSelector((state) => state.candidates)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [editableData, setEditableData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [appState, setAppState] = useState<AppState>('upload')
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null)

  const handleResumeparsed = (data: ParsedResume) => {
    setParsedResume(data)
    setEditableData({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || ''
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveCandidate = async () => {
    if (!parsedResume) return

    await dispatch(addCandidateAsync({
      name: editableData.name,
      email: editableData.email,
      phone: editableData.phone,
      resume_content: parsedResume.content
    }))

    // Move to interview phase
    setAppState('interview')
  }

  const handleInterviewComplete = (result: InterviewResult) => {
    setInterviewResult(result)
    setAppState('results')
  }

  const handleStartOver = () => {
    setAppState('upload')
    setParsedResume(null)
    setEditableData({ name: '', email: '', phone: '' })
    setInterviewResult(null)
  }

  // Render based on current app state
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


  if (appState === 'results' && interviewResult) {
    return (
      <InterviewResults
        candidateName={editableData.name}
        result={interviewResult}
        onStartOver={handleStartOver}
      />
    )
  }

  // Default upload/edit state
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">AI Interview Assistant</h1>
      
      <ResumeUpload onParsed={handleResumeparsed} />

      {parsedResume && (
        <Card>
          <CardHeader>
            <CardTitle>Review and Edit Information</CardTitle>
            <p className="text-sm text-gray-600">Please verify and edit any incorrect information below:</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={editableData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editableData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editableData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveCandidate} 
              disabled={loading || !editableData.name.trim() || !editableData.email.trim()}
              className="mt-6"
            >
              {loading ? 'Saving...' : 'Start Full Stack Interview'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
