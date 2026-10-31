# PROOFPATH — AI-Powered Career Operating System

<p align="center">
  <strong>Turn your career goals into a clear, evidence-backed action plan.</strong>
  <br />
  An AI-powered career workspace for understanding skill gaps, building job-ready skills, and preparing for opportunities.
  <br /><br />
  <a href="https://proofpath-o61j.onrender.com/">Live Demo</a> ·
  <a href="https://github.com/nikhilsaini7502-blip/Career">Source Code</a>
</p>

---

## What is PROOFPATH?

PROOFPATH is a multi-agent AI career platform designed to help students and early-career developers move from *“I want to get a job”* to *“I know what to learn, what to build, and how to demonstrate it.”*

Instead of treating career preparation as a collection of disconnected tasks, PROOFPATH brings career planning, skill intelligence, learning guidance, portfolio recommendations, and interview preparation into one workspace.

The project is actively evolving. Some modules are powered by AI APIs, while persistent storage is currently implemented for the signed-in user's core profile, skills, and skill evidence. More modules are being connected to the database incrementally.

## Core capabilities

| Capability | What it helps with |
| --- | --- |
| **Career role discovery** | Explore a role taxonomy and find roles by title, skill, or family. |
| **Job requirement research** | Analyse a target role or job description to understand expected requirements. |
| **Resume / profile parsing** | Extract structured career information from resume text. |
| **Skill gap analysis** | Compare current skills with the requirements of a target role. |
| **Evidence-based readiness** | Calculate career readiness using demonstrated skills and evidence. |
| **AI learning roadmap** | Generate a structured learning plan based on role, available time, and skill gaps. |
| **Portfolio project recommendations** | Get project ideas aligned with a target role and missing skills. |
| **Mock interview support** | Generate interview questions and evaluate answers. |
| **Application insights** | Review an application funnel and identify areas to improve. |
| **AI career assistant** | Interact with the multi-agent career assistant for contextual guidance. |

> Availability and persistence vary by module while development is in progress. Profile, skills, and skill-evidence data are currently persisted per signed-in user in Supabase.

## Tech stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

**Backend & AI**
- Node.js
- Express
- TypeScript
- Google Gemini via the Google GenAI SDK
- Multi-agent services for career guidance workflows

**Authentication & data**
- Supabase Auth (Google OAuth supported)
- Supabase PostgreSQL
- Row Level Security (RLS)
- Supabase Storage schema/policies for private resume uploads

**Deployment**
- Render

## Architecture at a glance

```text
┌───────────────────────────────┐
│        React + TypeScript     │
│       PROOFPATH Frontend      │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌──────────────────┐
│ Supabase Auth │  │ Express API      │
│ Google OAuth  │  │ /api/*            │
└───────┬───────┘  └────────┬─────────┘
        │                   │
        ▼                   ▼
┌───────────────┐  ┌──────────────────┐
│ Supabase      │  │ Gemini-powered   │
│ PostgreSQL    │  │ AI agents        │
│ + RLS         │  └──────────────────┘
└───────────────┘
```

## Getting started

### Prerequisites

- Node.js (a current LTS release is recommended)
- npm
- A Supabase project
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/nikhilsaini7502-blip/Career.git
cd Career
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Use `.env.example` as the template:

```env
# Browser-safe values
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

# Server-side values — keep these private
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Your application URL
APP_URL=http://localhost:3000
```

**Security notes**
- Never commit your real `.env` file.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or other server secrets in frontend code or variables prefixed with `VITE_`.
- The browser should use only the Supabase publishable/anon key. Keep Row Level Security enabled.

### 4. Set up Supabase

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the database migration and project configuration.

The database foundation includes these tables:

- `profiles`
- `skills`
- `skill_evidence`
- `learning_plans`
- `learning_tasks`
- `portfolio_projects`
- `job_applications`
- `interview_sessions`
- `conversations`
- `messages`
- `agent_runs`
- `resumes`

The current persistence integration covers **profiles, skills, and skill evidence**. The remaining tables provide the foundation for upcoming persistence work.

### 5. Run locally

```bash
npm run dev
```

The Express server starts the application and mounts the API under `/api`. In development, Vite is served through the Express server.

Open the local URL printed in your terminal (typically `http://localhost:3000`).

### 6. Build and type-check

```bash
npm run lint
npm run build
```

## API overview

The backend exposes the following routes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET | `/api/roles` | Search/filter the role catalogue |
| GET | `/api/roles/:id` | Get role details |
| POST | `/api/jobs/research` | Research job requirements |
| POST | `/api/resume/parse` | Parse resume or career text |
| POST | `/api/chat` | Multi-agent career assistant |
| POST | `/api/skills/audit` | Audit skill gaps |
| POST | `/api/roadmap/generate` | Generate a learning roadmap |
| POST | `/api/projects/recommend` | Recommend portfolio projects |
| POST | `/api/interviews/start` | Generate a mock interview question |
| POST | `/api/interviews/evaluate` | Evaluate an interview answer |
| POST | `/api/applications/audit` | Audit job applications |
| POST | `/api/progress/adapt` | Suggest progress-based plan adaptations |
| POST | `/api/readiness/calculate` | Calculate career readiness |

## Project structure

```text
.
├── src/
│   ├── components/       # UI components
│   ├── contexts/         # Authentication and career data state
│   ├── data/             # Role taxonomy and app data
│   ├── services/         # Supabase and persistence services
│   ├── tests/             # Tests
│   ├── types/             # TypeScript types
│   └── utils/             # Shared utilities and readiness logic
├── server/
│   ├── agents/            # AI career agents
│   ├── routes/            # Express API routes
│   └── services/          # AI service integrations
├── supabase/
│   └── migrations/        # SQL schema migrations
├── server.ts              # Express + Vite application entry
├── start.mjs              # Production server launcher
├── SUPABASE_SETUP.md      # Supabase setup guide
└── package.json
```

## Current development status

- [x] React + TypeScript frontend and Express API
- [x] Gemini-powered career agent workflows
- [x] Supabase project schema and Row Level Security policies
- [x] Supabase authentication with Google OAuth
- [x] Per-user persistence for profiles, skills, and skill evidence
- [ ] Persistence for learning plans and tasks
- [ ] Persistence for portfolio projects and job applications
- [ ] Persistence for interview sessions and AI conversations
- [ ] End-to-end tests for key user journeys
- [ ] Complete server-side JWT verification for protected user-specific API routes

**Production note:** The API routes are still being hardened. Do not treat user-specific backend endpoints as production-secure until Supabase access-token verification, authorization checks, and request validation are implemented and tested. Keep RLS enabled and never send service-role credentials to the browser.

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make your changes and run the checks:
   ```bash
   npm run lint
   npm run build
   ```
4. Commit your changes and open a pull request with a clear description.

## License

No license has been added to this repository yet. Until a license is included, the project remains under the default copyright terms; please do not assume it is open for unrestricted reuse.

---

<p align="center">
  Built with curiosity, code, and a goal to make career preparation more structured.
  <br />
  <strong>PROOFPATH</strong> · AI-Powered Career OS
</p>
