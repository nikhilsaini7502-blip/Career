import { generateGeneral, extractJsonFromText } from '../services/gemini';
import { JobApplication, SkillGapItem } from '../../src/types/career';

export interface ApplicationAuditResult {
  totalApplications: number;
  funnelBreakdown: Record<string, number>;
  responseRatePercent: number;
  interviewConversionPercent: number;
  diagnosisSummary: string;
  identifiedPatterns: string[];
  strategicRecommendations: string[];
}

export async function auditApplications(
  applications: JobApplication[],
  skillGaps: SkillGapItem[],
  targetRole: string
): Promise<ApplicationAuditResult> {
  const total = applications.length;
  const counts: Record<string, number> = {
    WISHLIST: 0,
    APPLIED: 0,
    SCREENING: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0
  };

  for (const app of applications) {
    counts[app.status] = (counts[app.status] || 0) + 1;
  }

  const responses = counts.SCREENING + counts.INTERVIEW + counts.OFFER + counts.REJECTED;
  const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const interviewConversions = counts.INTERVIEW + counts.OFFER;
  const interviewRate = responses > 0 ? Math.round((interviewConversions / responses) * 100) : 0;

  // If few or no applications
  if (total === 0) {
    return {
      totalApplications: 0,
      funnelBreakdown: counts,
      responseRatePercent: 0,
      interviewConversionPercent: 0,
      diagnosisSummary: 'No applications tracked yet. Add your recent job submissions to activate funnel diagnostics.',
      identifiedPatterns: ['Awaiting data to compute response velocity.'],
      strategicRecommendations: ['Focus on elevating unverified skills to APPLIED project proof before mass-applying.']
    };
  }

  const systemInstruction = `You are Agent 7: Application Intelligence Agent for PROOFPATH.
Analyze the user's application funnel and outcomes objectively.
Do NOT claim to know an employer's secret reasons without feedback.
Examine evidence gaps, conversion bottlenecks, and suggest targeting adjustments.
Return ONLY valid JSON matching:
{
  "diagnosisSummary": string,
  "identifiedPatterns": string[],
  "strategicRecommendations": string[]
}`;

  const prompt = `Target Role: ${targetRole}
Applications Summary:
Total: ${total}
Breakdown: ${JSON.stringify(counts)}
Response Rate: ${responseRate}%
Interview Conversion: ${interviewRate}%
Identified Skill Gaps in Profile: ${JSON.stringify(skillGaps.slice(0, 3).map(g => g.skill))}

Diagnose the funnel and provide strategic pivots.`;

  const raw = await generateGeneral(systemInstruction, prompt);

  const fallback: Pick<ApplicationAuditResult, 'diagnosisSummary' | 'identifiedPatterns' | 'strategicRecommendations'> = {
    diagnosisSummary: `Analyzed ${total} job applications for ${targetRole}. Primary bottleneck is early screening-to-interview drop-off.`,
    identifiedPatterns: [
      'Early stage rejection indicates resume might lack keywords or demonstrable evidence for core required skills.',
      'Applications with customized project links yield higher response rates than generic submissions.'
    ],
    strategicRecommendations: [
      `Elevate ${skillGaps[0]?.skill || 'core requirements'} from claimed to verified project evidence before next submission batch.`,
      'Refocus targeting towards roles matching your current strongest evidence profile.'
    ]
  };

  const parsed = extractJsonFromText(raw, fallback);

  return {
    totalApplications: total,
    funnelBreakdown: counts,
    responseRatePercent: responseRate,
    interviewConversionPercent: interviewRate,
    diagnosisSummary: parsed.diagnosisSummary || fallback.diagnosisSummary,
    identifiedPatterns: parsed.identifiedPatterns || fallback.identifiedPatterns,
    strategicRecommendations: parsed.strategicRecommendations || fallback.strategicRecommendations
  };
}
