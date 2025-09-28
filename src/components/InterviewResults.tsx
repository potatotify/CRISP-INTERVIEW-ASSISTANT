'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'

interface InterviewResult {
  score: number
  summary: string
  answers: { question: string; answer: string; timeSpent: number }[]
}

interface InterviewResultsProps {
  candidateName: string
  result: InterviewResult
  onStartOver: () => void
}

export default function InterviewResults({ candidateName, result, onStartOver }: InterviewResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    return score >= 50 ? (
      <CheckCircle className="h-12 w-12 text-green-500" />
    ) : (
      <XCircle className="h-12 w-12 text-red-500" />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getScoreIcon(result.score)}
          </div>
          <CardTitle className="text-2xl">Interview Completed!</CardTitle>
          <p className="text-gray-600">Results for {candidateName}</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}/100
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Detailed Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Question Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.answers.map((answer, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">Q{index + 1}: {answer.question}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {answer.timeSpent}s
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Answer:</strong> {answer.answer}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{result.answers.length}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {result.answers.filter(a => a.answer && !a.answer.includes('time ran out')).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(result.answers.reduce((sum, a) => sum + a.timeSpent, 0) / result.answers.length)}s
              </div>
              <div className="text-sm text-gray-600">Avg. Time</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.score >= 70 ? 'PASS' : result.score >= 50 ? 'AVERAGE' : 'NEEDS WORK'}
              </div>
              <div className="text-sm text-gray-600">Overall</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 justify-center">
            <Button onClick={onStartOver} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Interview Another Candidate
            </Button>
            <Button 
              onClick={() => window.print()} 
              variant="outline"
            >
              Print Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
