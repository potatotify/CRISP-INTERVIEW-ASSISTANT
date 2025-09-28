'use client'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, FileText, CheckCircle, User, Mail, Phone, AlertCircle } from 'lucide-react'

export interface ParsedResume {
  name: string
  email: string
  phone: string
  text: string
}

interface ResumeUploadProps {
  onParsed: (data: ParsedResume) => void
}

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null)
  const [editableData, setEditableData] = useState<ParsedResume | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadedFile(file)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Resume parsed:', result)
        
        const parsedResume: ParsedResume = {
          name: result.name || '',
          email: result.email || '',
          phone: result.phone || '',
          text: result.text || `Resume content from ${file.name}`
        }

        setParsedData(parsedResume)
        setEditableData({ ...parsedResume })
        
        // DON'T call onParsed here - wait for user confirmation
        
      } else {
        throw new Error('Failed to parse resume')
      }
    } catch (error) {
      console.error('❌ Resume parsing error:', error)
      
      // Create fallback data when parsing fails
      const fallbackData: ParsedResume = {
        name: '',
        email: '',
        phone: '',
        text: `Resume uploaded: ${file.name}. Please enter your details manually.`
      }
      
      setParsedData(fallbackData)
      setEditableData({ ...fallbackData })
      
      // DON'T call onParsed here either
      
    } finally {
      setUploading(false)
    }
  }, [])

  const handleInputChange = (field: keyof ParsedResume, value: string) => {
    if (!editableData) return
    setEditableData({ ...editableData, [field]: value })
  }

  // VALIDATE BEFORE CALLING onParsed
  const handleStartInterview = () => {
    if (!editableData) return
    
    // CLIENT-SIDE VALIDATION FIRST
    const missingFields = []
    
    if (!editableData.name || editableData.name.trim() === '') {
      missingFields.push('Full Name')
    }
    
    if (!editableData.email || editableData.email.trim() === '') {
      missingFields.push('Email Address')  
    }
    
    if (!editableData.phone || editableData.phone.trim() === '') {
      missingFields.push('Phone Number')
    }
    
    // STOP HERE if missing fields
    if (missingFields.length > 0) {
      alert(`❌ Please fill in all required fields:\n\n${missingFields.map(field => `• ${field}`).join('\n')}\n\nAll fields marked with * are required.`)
      return // DON'T PROCEED
    }
    
    // Additional validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editableData.email.trim())) {
      alert('❌ Please provide a valid email address.')
      return
    }
    
    if (editableData.phone.trim().replace(/\D/g, '').length < 10) {
      alert('❌ Please provide a valid phone number (at least 10 digits).')
      return
    }
    
    // ALL VALIDATIONS PASSED - NOW call onParsed
    console.log('✅ All validations passed, submitting:', editableData)
    onParsed(editableData)
  }

  const handleStartOver = () => {
    setUploadedFile(null)
    setParsedData(null)
    setEditableData(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    disabled: uploading || !!parsedData
  })

  // Step 1: File Upload
  if (!parsedData && !editableData) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer p-8 rounded-lg transition-colors ${
              isDragActive ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
            } ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600">Analyzing your resume...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Drag & drop your resume, or click to browse
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Supports: PDF, DOC, DOCX (Max 10MB)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 2: Show Parsed Data and Allow Editing (always show, even if fields missing)
  if (parsedData || editableData) {
    // Calculate what's missing for button state
    const missingFieldsCount = [
      !editableData?.name?.trim(),
      !editableData?.email?.trim(), 
      !editableData?.phone?.trim()
    ].filter(Boolean).length
    
    return (
      <div className="space-y-6">
        {/* File Info */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Resume processed!</p>
                <p className="text-sm text-green-600">{uploadedFile?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

       
        {/* Extracted Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Please Verify Your Information</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Review and complete the information extracted from your resume
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <User className="h-4 w-4" />
                <span>Full Name *</span>
              </label>
              <Input
                value={editableData?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={!editableData?.name ? 'border-red-300 bg-red-50' : ''}
                required
              />
              {!editableData?.name && (
                <p className="text-sm text-red-600">Name is required</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                <span>Email Address *</span>
              </label>
              <Input
                type="email"
                value={editableData?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={!editableData?.email ? 'border-red-300 bg-red-50' : ''}
                required
              />
              {!editableData?.email && (
                <p className="text-sm text-red-600">Email is required</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <Phone className="h-4 w-4" />
                <span>Phone Number *</span>
              </label>
              <Input
                value={editableData?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className={!editableData?.phone ? 'border-red-300 bg-red-50' : ''}
                required
              />
              {!editableData?.phone && (
                <p className="text-sm text-red-600">Phone number is required</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6">
              <Button 
                onClick={handleStartInterview} 
                className="flex-1"
                disabled={missingFieldsCount > 0}
              >
                {missingFieldsCount > 0 
                  ? `Complete ${missingFieldsCount} required field${missingFieldsCount > 1 ? 's' : ''}`
                  : 'Start Interview'
                }
              </Button>
              <Button variant="outline" onClick={handleStartOver}>
                Upload Different File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
