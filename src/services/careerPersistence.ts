import type { User } from '@supabase/supabase-js';
import type { SkillEvidenceRecord, UserProfile } from '../types/career';
import { supabase } from './supabase';

type ProfileRow = {
  id: string; display_name: string | null; target_role_id: string | null;
  target_role_title: string | null; target_family: string | null;
  experience_level: UserProfile['experienceLevel'] | null; daily_hours: number;
  bio: string | null; education: string | null; resume_summary: string | null;
  readiness_score: number; updated_at: string;
};

export function profileFromRow(row: ProfileRow, user: User): UserProfile {
  return {
    uid: user.id,
    displayName: row.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Career Builder',
    email: user.email || '',
    targetRoleId: row.target_role_id || 'full-stack-developer',
    targetRoleTitle: row.target_role_title || 'Full Stack Developer',
    targetFamily: (row.target_family || 'Software Engineering') as UserProfile['targetFamily'],
    experienceLevel: row.experience_level || 'Student',
    dailyHours: row.daily_hours ?? 2,
    readinessScore: Number(row.readiness_score ?? 0),
    bio: row.bio || undefined,
    education: row.education || undefined,
    resumeSummary: row.resume_summary || undefined,
    updatedAt: row.updated_at
  };
}

export async function loadCareerCore(user: User) {
  const [profileResult, skillsResult, evidenceResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('skills').select('skill_name, category, evidence_state').eq('user_id', user.id).order('skill_name'),
    supabase.from('skill_evidence').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ]);
  if (profileResult.error) throw profileResult.error;
  if (skillsResult.error) throw skillsResult.error;
  if (evidenceResult.error) throw evidenceResult.error;

  let profileRow = profileResult.data as ProfileRow | null;
  if (!profileRow) {
    const { data, error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Career Builder'
    }).select('*').single();
    if (error) throw error;
    profileRow = data as ProfileRow;
  }

  return {
    profile: profileFromRow(profileRow, user),
    skills: (skillsResult.data || []).map((row: any) => ({
      skillName: row.skill_name,
      category: row.category || undefined,
      evidenceState: row.evidence_state
    })),
    evidence: (evidenceResult.data || []).map((row: any): SkillEvidenceRecord => ({
      id: row.id,
      userId: row.user_id,
      skillName: row.skill_name,
      evidenceType: row.evidence_type,
      referenceTitle: row.reference_title || '',
      summary: row.summary || '',
      score: row.score == null ? undefined : Number(row.score),
      verified: row.verified,
      artifactUrl: row.artifact_url || undefined,
      createdAt: row.created_at
    }))
  };
}

export async function saveCareerProfile(profile: UserProfile, user: User) {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: profile.displayName,
    target_role_id: profile.targetRoleId,
    target_role_title: profile.targetRoleTitle,
    target_family: profile.targetFamily,
    experience_level: profile.experienceLevel,
    daily_hours: profile.dailyHours,
    bio: profile.bio || null,
    education: profile.education || null,
    resume_summary: profile.resumeSummary || null,
    readiness_score: profile.readinessScore,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function saveCareerSkills(skills: Array<{ skillName: string; category?: string; evidenceState: string }>, user: User) {
  if (!skills.length) return;
  const rows = skills.map(skill => ({
    user_id: user.id,
    skill_name: skill.skillName,
    category: skill.category || null,
    evidence_state: skill.evidenceState
  }));
  const { error } = await supabase.from('skills').upsert(rows, { onConflict: 'user_id,skill_name' });
  if (error) throw error;
}

export async function saveSkillEvidence(records: SkillEvidenceRecord[], user: User) {
  if (!records.length) return;
  const rows = records.map(record => ({
    user_id: user.id,
    skill_name: record.skillName,
    evidence_type: record.evidenceType,
    reference_title: record.referenceTitle,
    summary: record.summary,
    score: record.score ?? null,
    verified: record.verified,
    artifact_url: record.artifactUrl ?? null,
    created_at: record.createdAt
  }));
  const { error } = await supabase.from('skill_evidence').insert(rows);
  if (error) throw error;
}
