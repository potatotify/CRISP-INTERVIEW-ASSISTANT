"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Users, Clock, Brain, Loader2 } from "lucide-react" // Add Loader2
import { useRouter } from 'next/navigation'
import { useState } from 'react' // Add useState

export default function HomePage() {
  const router = useRouter()
  const [isLoadingInterview, setIsLoadingInterview] = useState(false)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)

  const handleStartInterview = async () => {
    setIsLoadingInterview(true)
    try {
      await router.push('/interviewee')
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      // Keep loading state until page actually loads
      // The cleanup will happen when component unmounts
    }
  }

  const handleAccessDashboard = async () => {
    setIsLoadingDashboard(true)
    try {
      await router.push('/interviewer')
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      // Keep loading state until page actually loads
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crisp AI Interview Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your interview process with AI-powered questions and real-time evaluation
          </p>
        </div>

        {/* Main Tabs Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="interviewee" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 h-15">
              <TabsTrigger value="interviewee" className="text-lg py-3">
                Interviewee Portal
              </TabsTrigger>
              <TabsTrigger value="interviewer" className="text-lg py-3">
                Interviewer Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Interviewee Tab */}
            <TabsContent value="interviewee" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Ready for your interview?</CardTitle>
                  <CardDescription className="text-lg">
                    Upload your resume and start your AI-powered interview session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <Upload className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Upload Resume</h3>
                      <p className="text-sm text-gray-600">PDF or DOCX format supported</p>
                    </div>
                    <div className="text-center p-4">
                      <Brain className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">AI Questions</h3>
                      <p className="text-sm text-gray-600">6 progressive difficulty questions</p>
                    </div>
                    <div className="text-center p-4">
                      <Clock className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Timed Responses</h3>
                      <p className="text-sm text-gray-600">Easy: 20s, Medium: 60s, Hard: 120s</p>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button 
                      size="lg" 
                      className="px-8" 
                      onClick={handleStartInterview}
                      disabled={isLoadingInterview}
                    >
                      {isLoadingInterview ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Interview...
                        </>
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interviewer Tab */}
            <TabsContent value="interviewer" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Interview Management</CardTitle>
                  <CardDescription className="text-lg">
                    Monitor candidates, review performance, and access detailed analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Candidate List</h3>
                      <p className="text-sm text-gray-600">View all candidates with scores</p>
                    </div>
                    <div className="text-center p-4">
                      <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">AI Analysis</h3>
                      <p className="text-sm text-gray-600">Detailed performance summaries</p>
                    </div>
                    <div className="text-center p-4">
                      <Clock className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Real-time</h3>
                      <p className="text-sm text-gray-600">Live interview monitoring</p>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="px-8" 
                      onClick={handleAccessDashboard}
                      disabled={isLoadingDashboard}
                    >
                      {isLoadingDashboard ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Dashboard...
                        </>
                      ) : (
                        'Access Dashboard'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">6</div>
            <div className="text-gray-600">Questions per interview</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-gray-600">Difficulty levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">AI</div>
            <div className="text-gray-600">Powered evaluation</div>
          </div>
        </div>
      </div>
    </div>
  )
}
