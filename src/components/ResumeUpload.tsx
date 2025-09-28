'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X } from 'lucide-react'
import { parseResume, type ParsedResume } from '@/utils/resumeParser'

interface ResumeUploadProps {
  onParsed: (data: ParsedResume) => void
}

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setError(null)
    setParsing(true)

    try {
      const parsed = await parseResume(uploadedFile)
      onParsed(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume')
    } finally {
      setParsing(false)
    }
  }, [onParsed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg mb-2">
            {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF and DOCX files
          </p>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm">{file.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {parsing && (
          <div className="mt-4 text-center text-blue-600">
            Parsing resume...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
