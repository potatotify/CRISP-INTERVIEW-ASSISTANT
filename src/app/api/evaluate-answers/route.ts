import { NextRequest, NextResponse } from 'next/server'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { PromptTemplate } from '@langchain/core/prompts'

export async function POST(request: NextRequest) {
  try {
    const { answers, candidateName, resumeContent } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers provided' }, { status: 400 })
    }

    // Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
    })

    // Format answers for evaluation
    const answersText = answers.map((answer: any, index: number) => `
Q${index + 1}: ${answer.question}
Answer: "${answer.answer}"
Time Spent: ${answer.timeSpent}s
Difficulty: ${getDifficultyFromIndex(index)}
---`).join('\n')

    // Improved prompt with strict JSON format
    const evaluationPrompt = PromptTemplate.fromTemplate(`
You are a STRICT technical interviewer. Score each answer 0-100 based on technical accuracy.

Candidate: {candidateName}
Interview Answers:
{answersText}

CRITICAL: Respond with ONLY valid JSON. No extra text before or after.

{{
  "overallScore": <number>,
  "individualScores": [
    {{"questionIndex": 0, "score": <number>, "feedback": "<feedback>"}},
    {{"questionIndex": 1, "score": <number>, "feedback": "<feedback>"}},
    {{"questionIndex": 2, "score": <number>, "feedback": "<feedback>"}},
    {{"questionIndex": 3, "score": <number>, "feedback": "<feedback>"}},
    {{"questionIndex": 4, "score": <number>, "feedback": "<feedback>"}},
    {{"questionIndex": 5, "score": <number>, "feedback": "<feedback>"}}
  ],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "recommendation": "Hire",
  "summary": "Assessment summary"
}}`)

    const formattedPrompt = await evaluationPrompt.format({
      candidateName,
      answersText
    })

    console.log('Sending to Gemini AI...')
    
    // Make multiple attempts with different prompts
    let evaluation = null
    let lastError = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.invoke([{
          role: "user", 
          content: formattedPrompt
        }])
        
        let responseText = result.content.toString().trim()
        console.log(`Attempt ${attempt} - AI Response:`, responseText)
        
        // Clean the response
        evaluation = cleanAndParseJSON(responseText)
        
        if (evaluation && validateEvaluation(evaluation, answers.length)) {
          console.log('Successfully parsed AI evaluation')
          break
        } else {
          throw new Error('Invalid evaluation structure')
        }
        
      } catch (error: any) {
        lastError = error
        console.warn(`Attempt ${attempt} failed:`, error.message)
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!evaluation) {
      console.error('All AI attempts failed:', lastError)
      return NextResponse.json({ 
        error: 'AI evaluation failed after multiple attempts. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json(evaluation)

  } catch (error) {
    console.error('AI evaluation error:', error)
    return NextResponse.json({ 
      error: 'AI evaluation service unavailable.' 
    }, { status: 503 })
  }
}

function cleanAndParseJSON(responseText: string): any {
  try {
    // Remove any markdown code blocks
    let cleanText = responseText.replace(/``````/g, '').trim()
    
    // Find JSON object boundaries
    const startIndex = cleanText.indexOf('{')
    const lastIndex = cleanText.lastIndexOf('}')
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error('No JSON object found')
    }
    
    const jsonString = cleanText.substring(startIndex, lastIndex + 1)
    
    // Fix common JSON issues
    let fixedJson = jsonString
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/\n/g, ' ')     // Remove newlines
      .replace(/\s+/g, ' ')    // Normalize whitespace
    
    console.log('Cleaned JSON:', fixedJson)
    
    return JSON.parse(fixedJson)
    
  } catch (parseError: any) {
    console.error('JSON parsing failed:', parseError.message)
    console.error('Original text:', responseText)
    throw new Error(`Failed to parse AI response: ${parseError.message}`)
  }
}

function validateEvaluation(evaluation: any, expectedQuestions: number): boolean {
  try {
    // Check required fields
    if (typeof evaluation.overallScore !== 'number') return false
    if (!Array.isArray(evaluation.individualScores)) return false
    if (evaluation.individualScores.length !== expectedQuestions) return false
    
    // Check each individual score
    for (const score of evaluation.individualScores) {
      if (typeof score.questionIndex !== 'number') return false
      if (typeof score.score !== 'number') return false
      if (typeof score.feedback !== 'string') return false
      if (score.score < 0 || score.score > 100) return false
    }
    
    // Check other required fields
    if (!Array.isArray(evaluation.strengths)) return false
    if (!Array.isArray(evaluation.improvements)) return false
    if (typeof evaluation.recommendation !== 'string') return false
    if (typeof evaluation.summary !== 'string') return false
    
    return true
    
  } catch (error) {
    console.error('Validation failed:', error)
    return false
  }
}

function getDifficultyFromIndex(index: number): string {
  if (index < 2) return 'Easy'
  if (index < 4) return 'Medium'  
  return 'Hard'
}
