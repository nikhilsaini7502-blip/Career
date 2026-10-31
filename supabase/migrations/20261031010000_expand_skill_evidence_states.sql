-- Keep the application's full evidence progression valid in the database.
alter table public.skills
  drop constraint if exists skills_evidence_state_check;

alter table public.skills
  add constraint skills_evidence_state_check
  check (evidence_state in ('CLAIMED','LEARNING','DEMONSTRATED','APPLIED','INTERVIEW_DEMONSTRATED'));
