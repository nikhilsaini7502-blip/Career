import { generateDeepReasoning, extractJsonFromText } from '../services/gemini';
import { LearningPlan, SkillEvidenceRecord, SkillGapItem, UserProfile } from '../../src/types/career';

export interface AdaptationProposal {
  requiresApproval: boolean;
  needsRevision: boolean;
  rationale: string;
  proposedChanges: string;
  suggestedActionItems: string[];
}

export async function evaluateProgressAndAdapt(
  profile: UserProfile,
  learningPlan: LearningPlan | null,
  recentEvidence: SkillEvidenceRecord[],
  currentGaps: SkillGapItem[]
): Promise<AdaptationProposal> {
  if (!learningPlan) {
    return {
      requiresApproval: false,
      needsRevision: false,
      rationale: 'No active roadmap found to adapt.',
      proposedChanges: 'Generate a baseline learning roadmap first.',
      suggestedActionItems: ['Initialize roadmap from Skill Intelligence view.']
    };
  }

  const completedTasks = learningPlan.tasks.filter(t => t.completed).length;
  const totalTasks = learningPlan.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Use Deep Thinking with Gemini 4 Argon to evaluate progress dynamics
  const systemInstruction = `You are Agent 8: Progress and Adaptation Agent for PROOFPATH.
Your role is to assess user momentum, setbacks, and evidence submissions.
Decide if the roadmap should be restructured.
For major changes (e.g. reprioritizing foundational topics or extending timeline), flag requiresApproval: true.
Return ONLY valid JSON matching:
{
  "requiresApproval": boolean,
  "needsRevision": boolean,
  "rationale": string,
  "proposedChanges": string,
  "suggestedActionItems": string[]
}`;

  const prompt = `User Target Role: ${profile.targetRoleTitle}
Roadmap Progress: ${completedTasks}/${totalTasks} tasks completed (${completionRate}%)
Recent Evidence Records: ${recentEvidence.length} (Verified: ${recentEvidence.filter(e => e.verified).length})
Remaining Critical Gaps: ${currentGaps.filter(g => g.importance === 'Critical').map(g => g.skill).join(', ')}

Analyze if the current roadmap pace and sequence are optimal or require adaptive adjustment.`;

  const raw = await generateDeepReasoning(systemInstruction, prompt);

  const fallback: AdaptationProposal = {
    requiresApproval: true,
    needsRevision: completionRate > 50 || recentEvidence.length >= 2,
    rationale: `User has demonstrated measurable progress (${completedTasks} tasks completed, ${recentEvidence.length} evidence artifacts verified).`,
    proposedChanges: `Accelerate upcoming advanced project milestone and integrate mock interview checkpoint.`,
    suggestedActionItems: [
      'Approve roadmap restructuring to focus on high-impact project deliverables',
      'Schedule a mock interview on recent demonstrated topics'
    ]
  };

  const parsed = extractJsonFromText<AdaptationProposal>(raw, fallback);
  return {
    requiresApproval: parsed.requiresApproval !== undefined ? parsed.requiresApproval : true,
    needsRevision: parsed.needsRevision !== undefined ? parsed.needsRevision : false,
    rationale: parsed.rationale || fallback.rationale,
    proposedChanges: parsed.proposedChanges || fallback.proposedChanges,
    suggestedActionItems: parsed.suggestedActionItems || fallback.suggestedActionItems
  };
}
