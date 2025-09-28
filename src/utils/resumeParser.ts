import mammoth from 'mammoth'

export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  content: string
  confidence?: 'high' | 'medium' | 'low'
  missingFields?: string[]
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    // Try API parsing first
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      const data = await response.json()
      return validateAndEnhance({
        name: data.name,
        email: data.email, 
        phone: data.phone,
        content: data.text || 'Resume content parsed'
      })
    } else {
      throw new Error('API parsing failed')
    }
  } catch (error) {
    console.warn('API parsing failed, trying fallback:', error)
    
    // Fallback to manual parsing
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDOCX(file)
    } else {
      // For PDFs that fail API parsing, return partial data
      return {
        name: '',
        email: '',
        phone: '',
        content: `Resume uploaded: ${file.name}`,
        confidence: 'low',
        missingFields: ['name', 'email', 'phone']
      }
    }
  }
}

function validateAndEnhance(data: Partial<ParsedResume>): ParsedResume {
  const missingFields: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'high'

  if (!data.name) {
    missingFields.push('name')
    confidence = 'medium'
  }
  if (!data.email) {
    missingFields.push('email')
    confidence = confidence === 'high' ? 'medium' : 'low'
  }
  if (!data.phone) {
    missingFields.push('phone')
    confidence = confidence === 'high' ? 'medium' : 'low'
  }

  return {
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    content: data.content || 'Resume parsed successfully',
    confidence,
    missingFields: missingFields.length > 0 ? missingFields : undefined
  }
}

async function parseDOCX(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return validateAndEnhance(extractInfo(result.value))
}

function extractInfo(content: string): Partial<ParsedResume> {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  
  const lines = content.split('\n').filter(line => line.trim())
  const nameRegex = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/
  let name = undefined
  
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim()
    if (trimmed.length > 3 && trimmed.length < 50) {
      const match = trimmed.match(nameRegex)
      if (match && !trimmed.includes('@') && !trimmed.includes('http')) {
        name = match[0]
        break
      }
    }
  }

  return {
    name,
    email: content.match(emailRegex)?.[0],
    phone: content.match(phoneRegex)?.[0],
    content
  }
}
