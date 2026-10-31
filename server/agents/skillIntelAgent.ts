import { computeSkillGaps, UserSkillItem } from '../../src/utils/evidenceEngine';
import { findRoleById, TECH_ROLES_TAXONOMY } from '../../src/data/rolesTaxonomy';
import { SkillGapItem, TechRole } from '../../src/types/career';
import { generateDeepReasoning, extractJsonFromText } from '../services/gemini';

export interface SkillAuditReport {
  targetRole: string;
  totalGapsIdentified: number;
  criticalGaps: SkillGapItem[];
  highGaps: SkillGapItem[];
  moderateGaps: SkillGapItem[];
  executiveSummary: string;
  recommendedProofStrategy: string;
}

export async function auditSkillGaps(
  targetRoleId: string,
  userSkills: UserSkillItem[]
): Promise<SkillAuditReport> {
  const role: TechRole = findRoleById(targetRoleId) || TECH_ROLES_TAXONOMY[0];
  const deterministicGaps = computeSkillGaps(userSkills, role);

  // Use deep reasoning with Gemini 4 Argon to synthesize a strategic proof recommendation
  const systemInstruction = `You are Agent 3: Skill Intelligence Agent for PROOFPATH.
You analyze skill gap vectors between user capabilities and role requirements.
Provide an executive synthesis and a high-leverage proof strategy.
Return ONLY valid JSON matching:
{
  "executiveSummary": string,
  "recommendedProofStrategy": string
}`;

  const prompt = `Target Role: ${role.title} (${role.family})
User Skills: ${JSON.stringify(userSkills)}
Computed Gaps: ${JSON.stringify(deterministicGaps.map(g => ({ skill: g.skill, importance: g.importance })))}

Synthesize the highest-leverage actionable insights for this candidate.`;

  const raw = await generateDeepReasoning(systemInstruction, prompt);
  const parsed = extractJsonFromText<any>(raw, {
    executiveSummary: `The primary bridge to ${role.title} requires elevating core skills to demonstrated proof.`,
    recommendedProofStrategy: `Build an end-to-end portfolio deliverable addressing ${deterministicGaps.slice(0, 2).map(g => g.skill).join(' and ')}.`
  });

  const criticalGaps = deterministicGaps.filter(g => g.importance === 'Critical');
  const highGaps = deterministicGaps.filter(g => g.importance === 'High');
  const moderateGaps = deterministicGaps.filter(g => g.importance === 'Medium' || g.importance === 'Nice to Have');

  return {
    targetRole: role.title,
    totalGapsIdentified: deterministicGaps.length,
    criticalGaps,
    highGaps,
    moderateGaps,
    executiveSummary: parsed.executiveSummary,
    recommendedProofStrategy: parsed.recommendedProofStrategy
  };
}
