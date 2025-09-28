import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all candidates
export async function GET() {
  try {
    console.log('📋 Fetching all candidates...')
    
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase fetch error:', error)
      throw error
    }

    console.log(`✅ Fetched ${candidates.length} candidates`)
    
    // Log candidates with interview results
    candidates.forEach(candidate => {
      const hasResults = candidate.interview_results && candidate.interview_results.length > 0
      console.log(`- ${candidate.name}: ${hasResults ? 'Completed' : 'Pending'}`)
    })

    return NextResponse.json(candidates)
  } catch (error) {
    console.error('❌ Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

// POST - Add new candidate  
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Adding new candidate...')
    
    const candidateData = await request.json()
    console.log('Candidate data:', candidateData)

    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw error
    }

    console.log('✅ Added candidate:', candidate.name)
    return NextResponse.json(candidate)
  } catch (error) {
    console.error('❌ Error adding candidate:', error)
    return NextResponse.json({ error: 'Failed to add candidate' }, { status: 500 })
  }
}
