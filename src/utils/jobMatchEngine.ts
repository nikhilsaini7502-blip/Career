import { JobMatch, TechRole } from '../types/career';
import { UserSkillItem, normalizeSkillName, EVIDENCE_WEIGHTS } from './evidenceEngine';

export function generateJobMatchesForRole(
  role: TechRole,
  userSkills: UserSkillItem[]
): JobMatch[] {
  const normUserMap = new Map<string, UserSkillItem>();
  for (const s of userSkills) {
    normUserMap.set(normalizeSkillName(s.skillName), s);
  }

  const companies = [
    { company: 'Stripe', location: 'Remote, US', salary: '$140k - $185k', type: 'Remote' as const, time: '2h ago' },
    { company: 'Vercel', location: 'San Francisco, CA', salary: '$145k - $190k', type: 'Hybrid' as const, time: '4h ago' },
    { company: 'Linear', location: 'Remote, Global', salary: '$135k - $175k', type: 'Remote' as const, time: '1d ago' },
    { company: 'Datadog', location: 'New York, NY', salary: '$130k - $170k', type: 'Hybrid' as const, time: '2d ago' },
    { company: 'Cloudflare', location: 'Austin, TX', salary: '$125k - $165k', type: 'On-site' as const, time: '3d ago' }
  ];

  return companies.map((c, idx) => {
    // Partition skills into matched vs missing
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let matchScorePoints = 0;

    for (const reqSkill of role.requiredSkills) {
      const found = normUserMap.get(normalizeSkillName(reqSkill));
      if (found && (found.evidenceState === 'DEMONSTRATED' || found.evidenceState === 'APPLIED' || found.evidenceState === 'INTERVIEW_DEMONSTRATED')) {
        matchedSkills.push(reqSkill);
        matchScorePoints += EVIDENCE_WEIGHTS[found.evidenceState];
      } else if (found && found.evidenceState === 'LEARNING') {
        matchedSkills.push(reqSkill);
        matchScorePoints += 0.5;
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const maxPoints = Math.max(1, role.requiredSkills.length);
    const calculatedPercentage = Math.round((matchScorePoints / maxPoints) * 100);
    // Base floor of at least 45% + bonus depending on overlap
    const finalScore = Math.min(98, Math.max(48, calculatedPercentage));

    return {
      id: `match-${role.id}-${idx}`,
      title: `${role.title}`,
      company: c.company,
      location: c.location,
      type: c.type,
      salary: c.salary,
      matchScore: finalScore,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : role.requiredSkills.slice(0, 2),
      missingSkills: missingSkills.length > 0 ? missingSkills : role.preferredSkills.slice(0, 2),
      postedTime: c.time,
      applyUrl: 'https://careers.greenhouse.io'
    };
  });
}
