import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Make params a Promise
) {
  console.log('=== SAVING INTERVIEW RESULTS ===')
  
  try {
    const { id: candidateId } = await params // Await params
    const resultsData = await request.json()
    
    console.log('Candidate ID:', candidateId)
    console.log('Results Data Received:', JSON.stringify(resultsData, null, 2))

    // First, check if candidate exists
    const { data: existingCandidate, error: fetchError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single()

    if (fetchError) {
      console.error('Error fetching candidate:', fetchError)
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    console.log('Existing candidate found:', existingCandidate.name)

    // Update candidate with interview results
    const { data: updatedCandidate, error: updateError } = await supabase
      .from('candidates')
      .update({
        interview_results: [resultsData],
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId)
      .select()
      .single()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('✅ Results saved successfully for:', updatedCandidate.name)
    console.log('Saved results preview:', {
      score: updatedCandidate.interview_results?.[0]?.score,
      recommendation: updatedCandidate.interview_results?.[0]?.recommendation
    })
    
    return NextResponse.json(updatedCandidate)
    
  } catch (error) {
    console.error('❌ Unexpected error saving results:', error)
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
  }
}
