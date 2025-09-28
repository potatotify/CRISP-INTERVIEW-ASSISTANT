import { supabase } from './supabase'

export interface Candidate {
  id?: string
  name: string
  email: string
  phone: string
  resume_content?: string
  score?: number
  ai_summary?: string
}

// Save a new candidate
export async function saveCandidate(candidate: Candidate) {
  const { data, error } = await supabase
    .from('candidates')
    .insert([candidate])
    .select()
    
  if (error) {
    console.error('Error saving candidate:', error)
    return null
  }
  
  return data[0]
}

// Get all candidates (for interviewer dashboard)
export async function getAllCandidates() {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching candidates:', error)
    return []
  }
  
  return data
}
