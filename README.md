# WorkforceMS Recruitment

Standalone recruitment module built with React + Vite + Supabase.
Connects to an existing BlindHire Supabase project.

## Setup

1. Copy `.env.example` to `.env` and fill in your keys:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_GROQ_API_KEY=
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run dev server:
   ```
   npm run dev
   ```

Required: Create a Supabase Storage bucket named 'cv-uploads'
with public access. Go to Storage → New Bucket → name: cv-uploads
→ Public bucket: ON

## Features

- **Dashboard** — live stats + recent applications table
- **Job Postings** — create/view jobs, filter by status, applicant drawer
- **Candidates** — filterable table, blinded/unblinded candidate drawer
- **Blind Screener** — AI-powered CV screening via Groq (llama-3.1-8b-instant)
- **Application Tracker** — Kanban board across 6 stages
- **Job Ad Checker** — bias detection + rewrite via Groq
