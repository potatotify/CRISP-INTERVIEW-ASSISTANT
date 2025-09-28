# Crisp AI Interview Assistant

A web application that conducts technical interviews using AI. Upload your resume, answer progressive questions, and get detailed feedback.

## What it does

- Upload resume in PDF/DOCX format
- AI asks 6 questions of increasing difficulty
- Real-time evaluation and scoring
- Detailed feedback on each answer
- Interview session persistence (survives page refresh)
- Dashboard for viewing all candidates and results

## Tech Stack

- Next.js 14 with TypeScript
- Supabase for database
- Redux Toolkit for state management
- Tailwind CSS for styling
- Gemini AI for question generation and evaluation
- APILayer for resume parsing

## Setup

1. Clone the repo
2. Install dependencies
3. Set up environment variables
Create `.env.local` file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
APILAYER_API_KEY=your_apilayer_key

4. Set up Supabase database
Run this SQL in your Supabase SQL editor:

5. Run the development server

## How to use

### For Candidates
1. Go to `/interviewee`
2. Upload your resume
3. Verify your information (name, email, phone)
4. Start the interview
5. Answer 6 progressive questions
6. Get your results and feedback

### For Interviewers
1. Go to `/interviewer`
2. View all candidates and their scores
3. Click on any candidate to see detailed results
4. Review answers and AI feedback

## Features

- **Smart Resume Parsing**: Automatically extracts name, email, phone from resumes
- **Progressive Difficulty**: Questions get harder as you progress
- **AI Evaluation**: Each answer is scored and given detailed feedback
- **Session Persistence**: Interview continues even if you refresh the page
- **Real-time Scoring**: See your progress throughout the interview
- **Comprehensive Dashboard**: View all interview results in one place

## Project Structure

src/
├── app/ # Next.js app router
│ ├── api/ # API routes
│ ├── interviewee/ # Candidate interface
│ ├── interviewer/ # Dashboard interface
│ └── layout.tsx # Root layout
├── components/ # React components
│ ├── InterviewChat.tsx # Main interview interface
│ ├── ResumeUpload.tsx # Resume upload component
│ └── ui/ # UI components
├── store/ # Redux store
│ ├── candidateSlice.ts # Candidate state management
│ └── store.ts # Store configuration
└── lib/ # Utilities
└── supabase.ts # Supabase client


## API Routes

- `POST /api/candidates` - Create new candidate
- `GET /api/candidates` - Get all candidates
- `POST /api/parse-resume` - Parse resume file
- `POST /api/evaluate-answers` - Get AI evaluation
- `POST /api/candidates/[id]/results` - Save interview results

## Known Issues

- Resume parsing might not work for all PDF formats
- Interview timer doesn't pause when tab is inactive
- Mobile layout could be improved

## Future Improvements

- Add video recording during interviews
- Support for more file formats
- Better mobile responsiveness
- Email notifications for completed interviews
- Export results to PDF

## License

MIT

---

Built with Next.js and deployed on Vercel.


