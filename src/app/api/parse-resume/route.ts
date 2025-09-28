import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64 for APILayer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const response = await fetch('https://api.apilayer.com/resume_parser/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'apikey': process.env.APILAYER_API_KEY!
      },
      body: buffer
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()

    return NextResponse.json({
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
  // Removed unused fields: skills, experience, education
      text: `Resume parsed successfully for ${data.name}`
    })

  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}
