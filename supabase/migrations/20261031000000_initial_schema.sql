-- PROOFPATH initial Supabase schema
-- Apply in Supabase SQL Editor or with: supabase db push

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  headline text,
  target_role_id text,
  target_role_title text,
  target_family text,
  experience_level text,
  daily_hours integer not null default 2 check (daily_hours between 0 and 24),
  bio text,
  education text,
  resume_summary text,
  readiness_score numeric(5,2) not null default 0 check (readiness_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  category text,
  evidence_state text not null default 'CLAIMED'
    check (evidence_state in ('CLAIMED','LEARNING','DEMONSTRATED','APPLIED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, skill_name)
);

create table if not exists public.skill_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete set null,
  skill_name text not null,
  evidence_type text not null,
  reference_title text,
  summary text,
  score numeric(5,2),
  verified boolean not null default false,
  artifact_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_title text not null,
  total_weeks integer not null default 8,
  current_week integer not null default 1,
  weekly_hours numeric(5,2) not null default 14,
  status text not null default 'active',
  plan_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.learning_plans(id) on delete cascade,
  week_number integer not null default 1,
  day_number integer,
  title text not null,
  description text,
  skill_addressed text,
  estimated_minutes integer,
  completed boolean not null default false,
  resource_title text,
  resource_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  skills_covered text[] not null default '{}',
  difficulty text,
  estimated_hours integer,
  status text not null default 'recommended',
  deliverables jsonb not null default '[]'::jsonb,
  verified_evidence boolean not null default false,
  repo_url text,
  demo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  location text,
  job_type text,
  salary_range text,
  status text not null default 'SAVED',
  applied_date date,
  notes text,
  rejection_feedback text,
  rejection_diagnosis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_role text,
  mode text,
  difficulty text,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  evaluation jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('user','assistant','system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  objective text,
  status text not null default 'queued',
  model_used text,
  duration_ms integer,
  input_summary text,
  output_summary text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  parsed_content text,
  parsed_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists skills_user_idx on public.skills(user_id);
create index if not exists evidence_user_created_idx on public.skill_evidence(user_id, created_at desc);
create index if not exists plans_user_updated_idx on public.learning_plans(user_id, updated_at desc);
create index if not exists tasks_plan_idx on public.learning_tasks(plan_id);
create index if not exists projects_user_idx on public.portfolio_projects(user_id);
create index if not exists applications_user_status_idx on public.job_applications(user_id, status);
create index if not exists interviews_user_created_idx on public.interview_sessions(user_id, created_at desc);
create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);
create index if not exists resumes_user_created_idx on public.resumes(user_id, created_at desc);

-- Row Level Security: every user-owned row is isolated by the authenticated user id.
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'skills','skill_evidence','learning_plans','learning_tasks',
    'portfolio_projects','job_applications','interview_sessions',
    'conversations','messages','agent_runs','resumes'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_own_access', t);
    execute format(
      'create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_own_access', t
    );
  end loop;
end $$;

-- Create a private bucket for uploaded resumes. Files live under <auth.uid()>/<filename>.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

drop policy if exists "resume_files_select_own" on storage.objects;
create policy "resume_files_select_own" on storage.objects
for select to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume_files_insert_own" on storage.objects;
create policy "resume_files_insert_own" on storage.objects
for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume_files_update_own" on storage.objects;
create policy "resume_files_update_own" on storage.objects
for update to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume_files_delete_own" on storage.objects;
create policy "resume_files_delete_own" on storage.objects
for delete to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Create a profile row automatically whenever a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
