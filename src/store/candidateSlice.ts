import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string  // Keep as optional
  resume_content: string
  created_at: string
  interview_results?: any[]
  updated_at?: string
}


interface CandidateState {
  candidates: Candidate[]
  currentCandidate: Candidate | null
  loading: boolean
  error: string | null
}

const initialState: CandidateState = {
  candidates: [],
  currentCandidate: null,
  loading: false,
  error: null
}

// Add candidate async thunk
export const addCandidateAsync = createAsyncThunk(
  'candidates/addCandidate',
  async (candidateData: {
    name: string
    email: string
    phone: string
    resume_content: string
  }) => {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData)
    })

    if (!response.ok) {
      throw new Error('Failed to add candidate')
    }

    return await response.json()
  }
)

// Fetch candidates async thunk
export const fetchCandidatesAsync = createAsyncThunk(
  'candidates/fetchCandidates',
  async () => {
    const response = await fetch('/api/candidates')

    if (!response.ok) {
      throw new Error('Failed to fetch candidates')
    }

    return await response.json()
  }
)

// Save interview results async thunk
export const saveInterviewResultAsync = createAsyncThunk(
  'candidates/saveInterviewResult',
  async ({ candidateId, results }: { candidateId: string; results: any }) => {
    const response = await fetch(`/api/candidates/${candidateId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    })

    if (!response.ok) {
      throw new Error('Failed to save interview results')
    }

    return await response.json()
  }
)

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null
    },
    setCurrentCandidate: (state, action) => {
      state.currentCandidate = action.payload
    }
  },
  extraReducers: (builder) => {
    // Add candidate
    builder
      .addCase(addCandidateAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCandidateAsync.fulfilled, (state, action) => {
        state.loading = false
        state.currentCandidate = action.payload
        state.candidates.unshift(action.payload) // Add to beginning
      })
      .addCase(addCandidateAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add candidate'
      })

    // Fetch candidates
    builder
      .addCase(fetchCandidatesAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCandidatesAsync.fulfilled, (state, action) => {
        state.loading = false
        state.candidates = action.payload
      })
      .addCase(fetchCandidatesAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch candidates'
      })

    // Save interview results
    builder
      .addCase(saveInterviewResultAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(saveInterviewResultAsync.fulfilled, (state, action) => {
        state.loading = false
        // Update the candidate with new results
        const candidateIndex = state.candidates.findIndex(c => c.id === action.payload.id)
        if (candidateIndex !== -1) {
          state.candidates[candidateIndex] = action.payload
        }
      })
      .addCase(saveInterviewResultAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to save results'
      })
  }
})

export const { clearCurrentCandidate, setCurrentCandidate } = candidateSlice.actions
export default candidateSlice.reducer
