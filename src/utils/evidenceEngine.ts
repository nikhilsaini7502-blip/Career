import { EvidenceState, SkillGapItem, TechRole } from '../types/career';

export interface UserSkillItem {
  skillName: string;
  category?: string;
  evidenceState: EvidenceState;
  score?: number;
}

export const EVIDENCE_WEIGHTS: Record<EvidenceState, number> = {
  CLAIMED: 0.25,
  LEARNING: 0.45,
  DEMONSTRATED: 0.70,
  APPLIED: 0.90,
  INTERVIEW_DEMONSTRATED: 1.00
};

/**
 * Calculates a transparent, multi-factor Career Readiness Score (0 - 100)
 * based on role requirements, user skills, and verified evidence stages.
 */
export function calculateCareerReadiness(
  userSkills: UserSkillItem[],
  role: TechRole
): {
  overallScore: number;
  requiredSkillsCovered: number;
  totalRequiredSkills: number;
  preferredSkillsCovered: number;
  totalPreferredSkills: number;
  evidenceBreakdown: Record<EvidenceState, number>;
} {
  const normMap = new Map<string, UserSkillItem>();
  for (const s of userSkills) {
    normMap.set(normalizeSkillName(s.skillName), s);
  }

  let requiredScoreSum = 0;
  let requiredCoveredCount = 0;
  for (const reqSkill of role.requiredSkills) {
    const matched = normMap.get(normalizeSkillName(reqSkill));
    if (matched) {
      requiredCoveredCount++;
      requiredScoreSum += EVIDENCE_WEIGHTS[matched.evidenceState];
    }
  }

  let preferredScoreSum = 0;
  let preferredCoveredCount = 0;
  for (const prefSkill of role.preferredSkills) {
    const matched = normMap.get(normalizeSkillName(prefSkill));
    if (matched) {
      preferredCoveredCount++;
      preferredScoreSum += EVIDENCE_WEIGHTS[matched.evidenceState];
    }
  }

  const reqDenominator = Math.max(1, role.requiredSkills.length);
  const prefDenominator = Math.max(1, role.preferredSkills.length);

  // 75% weighted towards required skills, 25% towards preferred skills
  const normalizedReqScore = (requiredScoreSum / reqDenominator) * 100;
  const normalizedPrefScore = (preferredScoreSum / prefDenominator) * 100;
  const rawOverall = (normalizedReqScore * 0.75) + (normalizedPrefScore * 0.25);

  const evidenceBreakdown: Record<EvidenceState, number> = {
    CLAIMED: 0,
    LEARNING: 0,
    DEMONSTRATED: 0,
    APPLIED: 0,
    INTERVIEW_DEMONSTRATED: 0
  };

  for (const s of userSkills) {
    if (evidenceBreakdown[s.evidenceState] !== undefined) {
      evidenceBreakdown[s.evidenceState]++;
    }
  }

  return {
    overallScore: Math.round(Math.min(100, Math.max(0, rawOverall))),
    requiredSkillsCovered: requiredCoveredCount,
    totalRequiredSkills: role.requiredSkills.length,
    preferredSkillsCovered: preferredCoveredCount,
    totalPreferredSkills: role.preferredSkills.length,
    evidenceBreakdown
  };
}

/**
 * Normalizes skill strings to match synonyms (e.g. 'react.js' -> 'react')
 */
export function normalizeSkillName(name: string): string {
  const clean = name.toLowerCase().trim();
  if (clean.includes('react') && !clean.includes('native')) return 'react';
  if (clean.includes('node')) return 'node';
  if (clean.includes('typescript') || clean === 'ts') return 'typescript';
  if (clean.includes('javascript') || clean === 'js') return 'javascript';
  if (clean.includes('python')) return 'python';
  if (clean.includes('postgres') || clean.includes('psql')) return 'postgresql';
  if (clean.includes('k8s') || clean.includes('kubernetes')) return 'kubernetes';
  if (clean.includes('docker')) return 'docker';
  if (clean.includes('aws')) return 'aws';
  if (clean.includes('gcp') || clean.includes('google cloud')) return 'gcp';
  return clean;
}

/**
 * Computes transparent Skill Gap items comparing target role requirements with user skills
 */
export function computeSkillGaps(
  userSkills: UserSkillItem[],
  role: TechRole
): SkillGapItem[] {
  const normMap = new Map<string, UserSkillItem>();
  for (const s of userSkills) {
    normMap.set(normalizeSkillName(s.skillName), s);
  }

  const gaps: SkillGapItem[] = [];

  // Check required skills
  for (const reqSkill of role.requiredSkills) {
    const existing = normMap.get(normalizeSkillName(reqSkill));
    if (!existing) {
      gaps.push({
        skill: reqSkill,
        category: 'Core Language',
        importance: 'Critical',
        currentEvidence: 'CLAIMED', // Missing evidence
        recommendedAction: `Complete an assessment or build a practice project demonstrating ${reqSkill}.`,
        whyItMatters: `Standard baseline requirement for ${role.title} candidates.`,
        estimatedHoursToDemonstrate: 12
      });
    } else if (existing.evidenceState === 'CLAIMED' || existing.evidenceState === 'LEARNING') {
      gaps.push({
        skill: reqSkill,
        category: 'Core Language',
        importance: 'High',
        currentEvidence: existing.evidenceState,
        recommendedAction: `Elevate evidence from ${existing.evidenceState} to DEMONSTRATED or APPLIED via project proof.`,
        whyItMatters: `Employers look for demonstrable proof rather than unverified self-claims.`,
        estimatedHoursToDemonstrate: 8
      });
    }
  }

  // Check preferred skills
  for (const prefSkill of role.preferredSkills) {
    const existing = normMap.get(normalizeSkillName(prefSkill));
    if (!existing) {
      gaps.push({
        skill: prefSkill,
        category: 'Framework',
        importance: 'Medium',
        currentEvidence: 'CLAIMED',
        recommendedAction: `Explore fundamentals and build a mini-deliverable using ${prefSkill}.`,
        whyItMatters: `Differentiator that gives candidates a competitive edge in interviews.`,
        estimatedHoursToDemonstrate: 6
      });
    }
  }

  return gaps;
}
