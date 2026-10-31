# PROOFPATH — Supabase setup (Phase 1)

This migration establishes the PostgreSQL data model, per-user Row Level Security (RLS), and a private resume-upload bucket.

## 1. Create the Supabase project
1. Open https://supabase.com/dashboard and create a project.
2. Choose a strong database password and save it privately.
3. Wait until the project is ready.
4. Open **SQL Editor → New query**.
5. Paste the complete SQL from `supabase/migrations/20261031000000_initial_schema.sql` and click **Run**.

## 2. Copy project credentials
Open **Project Settings → API** (or **Data API**):
- Project URL → `VITE_SUPABASE_URL`
- Publishable/anon key → `VITE_SUPABASE_ANON_KEY`
- Secret/service_role key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

Never put the secret/service_role key in a `VITE_*` variable, frontend code, GitHub, screenshots, or chat. The browser uses only the publishable/anon key; RLS protects user rows.

## 3. Configure local environment
Create a local `.env` (do not commit it) with:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_SERVICE_ROLE_KEY
```

Add the same variables in Render → PROOFPATH service → Environment. Keep the service-role key server-side only.

## 4. Verify the schema
In Supabase **Table Editor**, confirm these tables exist:
`profiles`, `skills`, `skill_evidence`, `learning_plans`, `learning_tasks`, `portfolio_projects`, `job_applications`, `interview_sessions`, `conversations`, `messages`, `agent_runs`, and `resumes`.

The migration creates RLS policies for each user-owned table and a private `resumes` Storage bucket. A profile row is created automatically after Supabase Auth signup.

## Important migration notes
- This is the database foundation, not the full Firebase-to-Supabase auth cutover. Existing Firebase sign-in remains unchanged until the next phase.
- Do not copy demo candidate data (Alex Chen) into real user accounts. The next phase will replace hard-coded frontend state with authenticated, per-user reads/writes.
- Do not disable RLS to make requests work. Fix the user's JWT/session or policy instead.
- Before production, add automated migration checks, backup/PITR settings, request validation, rate limits, and end-to-end tests.
