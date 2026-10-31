import { ResumeAtsScore, TechRole } from '../types/career';
import { UserSkillItem } from './evidenceEngine';

export function calculateResumeAtsScore(
  resumeText: string,
  userSkills: UserSkillItem[],
  targetRole: TechRole
): ResumeAtsScore {
  const text = (resumeText || '').toLowerCase();
  
  // Keyword density with token/alias support
  let keywordHits = 0;
  for (const skill of targetRole.requiredSkills) {
    const parts = skill.toLowerCase().split(/[\s/,&]+/).map(p => p.trim()).filter(p => p.length > 2);
    const hitInText = text.includes(skill.toLowerCase()) || parts.some(p => text.includes(p));
    const hitInSkills = userSkills.some(s => {
      const sLower = s.skillName.toLowerCase();
      return sLower.includes(skill.toLowerCase()) || skill.toLowerCase().includes(sLower) || parts.some(p => sLower.includes(p));
    });

    if (hitInText || hitInSkills) {
      keywordHits++;
    }
  }
  const keywordPct = Math.round((keywordHits / Math.max(1, targetRole.requiredSkills.length)) * 100);

  // Quantified achievements check (e.g., % signs, numbers, metrics)
  const numbersCount = (resumeText.match(/\b\d+(\.\d+)?%?(\+)?\b/g) || []).length;
  const quantifiedScore = Math.min(100, Math.max(50, numbersCount * 12 + 40));

  // Structure score
  const hasSections = (text.includes('experience') || text.includes('education') || text.includes('skills') || text.includes('projects'));
  const structureScore = hasSections ? 92 : 65;

  const overall = Math.round((keywordPct * 0.45) + (quantifiedScore * 0.35) + (structureScore * 0.20));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (keywordPct >= 70) {
    strengths.push(`High density of required keywords for ${targetRole.title}.`);
  } else {
    improvements.push(`Include missing core keywords: ${targetRole.requiredSkills.slice(0, 3).join(', ')}.`);
  }

  if (numbersCount >= 3) {
    strengths.push('Quantified achievements and metrics detected (latency, percent improvements).');
  } else {
    improvements.push('Add measurable metrics (e.g. "reduced latency by 35%", "scaled API to 10k req/s").');
  }

  if (hasSections) {
    strengths.push('Clean logical hierarchy compatible with ATS parsers.');
  }

  return {
    overallScore: Math.min(96, Math.max(45, overall)),
    keywordMatchScore: keywordPct,
    quantifiedImpactScore: quantifiedScore,
    structureScore,
    strengths,
    improvements
  };
}
