'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Clock, CheckCircle, XCircle, AlertCircle, User, Mail, Phone, FileText } from 'lucide-react'

interface Answer {
  question: string
  answer: string
  timeSpent: number
}

interface IndividualScore {
  questionIndex: number
  score: number
  feedback: string
}

interface AIEvaluation {
  overallScore: number
  individualScores: IndividualScore[]
  strengths: string[]
  improvements: string[]
  recommendation: 'Hire' | 'Maybe' | 'No Hire'
  summary: string
}

interface InterviewResult {
  score: number
  summary: string
  answers: Answer[]
  aiEvaluation: AIEvaluation
  completedAt: string
  recommendation: string
}

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  resume_content: string
  created_at: string
  interview_results?: InterviewResult[] | string // Handle both parsed and string format
  updated_at?: string
}

interface CandidateDetailModalProps {
  candidate: Candidate
  onClose: () => void
}

export default function CandidateDetailModal({ candidate, onClose }: CandidateDetailModalProps) {
  // Parse interview_results if it's a string (from Supabase)
  let parsedResults: InterviewResult[] = []
  
  if (candidate.interview_results) {
    if (typeof candidate.interview_results === 'string') {
      try {
        parsedResults = JSON.parse(candidate.interview_results)
      } catch (error) {
        console.error('Error parsing interview results:', error)
      }
    } else {
      parsedResults = candidate.interview_results
    }
  }

  const latestResult = parsedResults[0]

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100 border-green-200'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-red-600 bg-red-100 border-red-200'
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Hire': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Maybe': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default: return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Hire': return 'bg-green-500 text-white'
      case 'Maybe': return 'bg-yellow-500 text-white'
      default: return 'bg-red-500 text-white'
    }
  }

  const getDifficultyBadge = (index: number) => {
    if (index < 2) return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Easy</Badge>
    if (index < 4) return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">Medium</Badge>
    return <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Hard</Badge>
  }

  const getTimeColor = (timeSpent: number, index: number) => {
    const limits = [20, 20, 60, 60, 120, 120] // Time limits per question
    const limit = limits[index]
    if (timeSpent === 0) return 'text-red-500' // Timeout
    if (timeSpent <= limit * 0.5) return 'text-green-500' // Fast
    if (timeSpent <= limit * 0.8) return 'text-yellow-500' // Good
    return 'text-orange-500' // Close to limit
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
              <p className="text-gray-600">ID: {candidate.id.substring(0, 8)}...</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-sm">{candidate.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-sm">{candidate.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Applied</p>
                    <p className="font-medium text-sm">{new Date(candidate.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Resume</p>
                    <p className="font-medium text-sm truncate">
                      {candidate.resume_content?.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!latestResult ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Interview not completed yet</p>
                <p className="text-gray-400 text-sm">This candidate hasn't taken the technical interview.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overall Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Interview Results</span>
                    <Badge className={getRecommendationColor(latestResult.aiEvaluation?.recommendation || latestResult.recommendation || 'No Hire')}>
                      {getRecommendationIcon(latestResult.aiEvaluation?.recommendation || latestResult.recommendation || 'No Hire')}
                      <span className="ml-2">{latestResult.aiEvaluation?.recommendation || latestResult.recommendation || 'No Hire'}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-2 p-6 rounded-lg border-2 ${getScoreColor(latestResult.score || latestResult.aiEvaluation?.overallScore || 0)}`}>
                        {latestResult.score || latestResult.aiEvaluation?.overallScore || 0}/100
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2 p-6 rounded-lg bg-gray-50">
                        {latestResult.answers?.length || 0}/6
                      </div>
                      <p className="text-sm text-gray-600">Questions Answered</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold mb-2 p-6 rounded-lg bg-blue-50 text-blue-600">
                        {new Date(latestResult.completedAt).toLocaleDateString()}
                        <br />
                        <span className="text-sm font-normal">
                          {new Date(latestResult.completedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Completed On</p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                      AI Assessment Summary
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {latestResult.aiEvaluation?.summary || latestResult.summary}
                    </p>
                  </div>

                  {/* Strengths and Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Strengths ({latestResult.aiEvaluation?.strengths?.length || 0})
                      </h4>
                      <ul className="space-y-2">
                        {(latestResult.aiEvaluation?.strengths || []).map((strength, index) => (
                          <li key={index} className="text-green-700 text-sm flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                      {!latestResult.aiEvaluation?.strengths?.length && (
                        <p className="text-green-600 text-sm italic">No specific strengths identified.</p>
                      )}
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Areas for Improvement ({latestResult.aiEvaluation?.improvements?.length || 0})
                      </h4>
                      <ul className="space-y-2">
                        {(latestResult.aiEvaluation?.improvements || []).map((improvement, index) => (
                          <li key={index} className="text-orange-700 text-sm flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Q&A Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Question-by-Question Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {latestResult.answers?.map((answer, index) => {
                    const individualScore = latestResult.aiEvaluation?.individualScores?.find(
                      s => s.questionIndex === index
                    )
                    
                    return (
                      <div key={index} className="border-2 border-gray-100 rounded-lg p-6 space-y-4 hover:border-gray-200 transition-colors">
                        {/* Question Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                Question {index + 1}
                              </span>
                              {getDifficultyBadge(index)}
                              <div className="flex items-center space-x-1 text-xs">
                                <Clock className="h-3 w-3" />
                                <span className={getTimeColor(answer.timeSpent, index)}>
                                  {answer.timeSpent === 0 ? 'Timeout' : `${answer.timeSpent}s`}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-900 font-medium text-lg leading-relaxed">
                              {answer.question}
                            </p>
                          </div>
                          
                          {individualScore && (
                            <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ml-4 ${getScoreColor(individualScore.score)}`}>
                              {individualScore.score}/100
                            </div>
                          )}
                        </div>

                        {/* Candidate Answer */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm font-semibold text-blue-600 mb-2">Candidate's Answer:</p>
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {answer.answer || 'No answer provided'}
                          </p>
                        </div>

                        {/* AI Feedback */}
                        {individualScore && (
                          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-sm font-semibold text-purple-600 mb-2">AI Feedback & Analysis:</p>
                            <p className="text-purple-800 leading-relaxed">
                              {individualScore.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
