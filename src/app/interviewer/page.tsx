'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, Eye, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import CandidateDetailModal from '@/components/CandidateDetailModal' // Add this import


// Add this interface to match your database structure
interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  resume_content: string
  created_at: string
  interview_results?: string | any[] // Can be string (from DB) or parsed array
  updated_at?: string
}

export default function InterviewerDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null) // Add this state

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Fetching candidates from API...')
      
      const response = await fetch('/api/candidates', {
        method: 'GET',
        cache: 'no-cache'
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched candidates:', data)
      
      setCandidates(data)
    } catch (err: any) {
      console.error('❌ Error fetching candidates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  // Helper function to check if candidate has completed interview
  const hasCompletedInterview = (candidate: Candidate) => {
    if (!candidate.interview_results) return false
    
    if (typeof candidate.interview_results === 'string') {
      try {
        const parsed = JSON.parse(candidate.interview_results)
        return parsed && parsed.length > 0
      } catch {
        return false
      }
    }
    
    return candidate.interview_results.length > 0
  }

  // Helper function to get interview result
  const getInterviewResult = (candidate: Candidate) => {
    if (!hasCompletedInterview(candidate)) return null
    
    try {
      if (typeof candidate.interview_results === 'string') {
        const parsed = JSON.parse(candidate.interview_results)
        return parsed[0]
      }
      return candidate.interview_results?.[0]
    } catch {
      return null
    }
  }

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const hasResults = hasCompletedInterview(candidate)
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && hasResults) ||
                         (filterStatus === 'pending' && !hasResults)
    
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    totalCandidates: candidates.length,
    completedInterviews: candidates.filter(c => hasCompletedInterview(c)).length,
    pendingInterviews: candidates.filter(c => !hasCompletedInterview(c)).length,
    avgScore: candidates.reduce((sum, c) => {
      const result = getInterviewResult(c)
      const score = result?.score || result?.aiEvaluation?.overallScore || 0
      return sum + score
    }, 0) / Math.max(candidates.filter(c => hasCompletedInterview(c)).length, 1)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Hire': return 'bg-green-500'
      case 'Maybe': return 'bg-yellow-500'
      default: return 'bg-red-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading candidates...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchCandidates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Interviewer Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCandidates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          
          </div>
        </div>

       

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {(['all', 'completed', 'pending'] as const).map(status => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    onClick={() => setFilterStatus(status)}
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Results ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No candidates found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Candidate</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Score</th>
                      <th className="text-left p-4 font-medium">Recommendation</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate) => {
                      const result = getInterviewResult(candidate)
                      const score = result?.score || result?.aiEvaluation?.overallScore || 0
                      const recommendation = result?.aiEvaluation?.recommendation || result?.recommendation
                      
                      return (
                        <tr key={candidate.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900">{candidate.name}</p>
                              <p className="text-sm text-gray-600">ID: {candidate.id.substring(0, 8)}...</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm text-gray-900">{candidate.email}</p>
                              <p className="text-sm text-gray-600">{candidate.phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={result ? 'default' : 'secondary'}>
                              {result ? 'Completed' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {result ? (
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                                {score}/100
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {result && recommendation ? (
                              <Badge className={getRecommendationColor(recommendation)}>
                                {recommendation}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-600">
                              {new Date(candidate.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCandidate(candidate)} // This opens the modal
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal - This is where your component gets used! */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
