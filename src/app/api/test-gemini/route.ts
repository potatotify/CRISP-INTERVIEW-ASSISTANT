import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    
    // Try different model names
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ]
    
    const results = []
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Hello, test message.')
        const response = await result.response
        results.push({ model: modelName, status: 'success', response: response.text() })
      } catch (error: any) {
        results.push({ model: modelName, status: 'failed', error: error.message })
      }
    }
    
    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
