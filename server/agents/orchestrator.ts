import { generateFast, generateGeneral, extractJsonFromText } from '../services/gemini';
import { AgentExecutionLog, ChatMessage, UserProfile } from '../../src/types/career';
import { parseResumeOrText } from './profileAgent';
import { researchJobRequirements } from './jobResearchAgent';
import { auditSkillGaps } from './skillIntelAgent';
import { generateLearningRoadmap } from './learningPlanner';
import { recommendPortfolioProjects } from './portfolioAgent';
import { evaluateProgressAndAdapt } from './progressAgent';

export interface OrchestrationResult {
  message: ChatMessage;
  agentLogs: AgentExecutionLog[];
  stateUpdates?: Record<string, unknown>;
  requiresApproval?: boolean;
  approvalPayload?: unknown;
}

export async function processUserIntent(
  userId: string,
  userMessage: string,
  userProfile: UserProfile,
  contextData: {
    skills?: Array<{ skillName: string; evidenceState: any }>;
    learningPlan?: any;
    recentEvidence?: any[];
  }
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  const agentLogs: AgentExecutionLog[] = [];

  // Step 1: Fast Intent Classification (Agent 0 using gemini-3.1-flash-lite)
  const classificationSystemPrompt = `You are Agent 0: Career Orchestrator for PROOFPATH.
Classify the user prompt into one primary workflow intent:
- 'resume_analysis': User mentions analyzing resume, background, or uploaded profile.
- 'skill_gap_audit': User asks about missing skills, role requirements, or comparison.
- 'roadmap_generation': User wants a learning plan, schedule, or curriculum.
- 'portfolio_recommendation': User asks what projects to build.
- 'interview_prep': User wants mock interview questions, practice, or feedback.
- 'application_audit': User mentions job applications, rejections, or job search.
- 'progress_adaptation': User wants to update progress, adapt roadmap, or report a milestone.
- 'general_guidance': General questions, questions about ProofPath, or career advice.

Return ONLY valid JSON matching:
{
  "intent": string,
  "confidence": number,
  "specialistsRequired": string[]
}`;

  const classificationRaw = await generateFast(
    classificationSystemPrompt,
    `User message: "${userMessage}"\nTarget role: ${userProfile.targetRoleTitle}`
  );

  const fallbackClassification = {
    intent: 'general_guidance',
    confidence: 0.9,
    specialistsRequired: ['career_orchestrator']
  };

  const classified = extractJsonFromText(classificationRaw, fallbackClassification);

  // Log Orchestrator Step
  agentLogs.push({
    id: `log-orch-${Date.now()}`,
    agent: 'Agent 0: Career Orchestrator',
    role: 'Central Workflow Controller',
    objective: `Intent classified as: ${classified.intent}`,
    status: 'completed',
    modelUsed: 'gemini-3.1-flash-lite',
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    outputSummary: `Routed intent '${classified.intent}' to specialists: [${classified.specialistsRequired.join(', ')}]`
  });

  let responseText = '';
  let requiresApproval = false;
  let approvalPayload: unknown = null;
  const stateUpdates: Record<string, unknown> = {};

  // Step 2: Dispatch to Specialist Agents
  if (classified.intent === 'resume_analysis') {
    const pStart = Date.now();
    const profileData = await parseResumeOrText(userMessage);
    agentLogs.push({
      id: `log-prof-${Date.now()}`,
      agent: 'Agent 1: Career Profile Agent',
      role: 'Profile & Resume Specialist',
      objective: 'Extract structured skills and qualifications',
      status: 'completed',
      modelUsed: 'gemini-3.8-flash',
      durationMs: Date.now() - pStart,
      timestamp: new Date().toISOString(),
      outputSummary: `Identified ${profileData.detectedSkills.length} skills. Experience: ${profileData.experienceLevel}`
    });

    stateUpdates.extractedProfile = profileData;
    responseText = `I have parsed your background details. **Agent 1 (Profile Agent)** identified **${profileData.detectedSkills.length} key skills** (${profileData.detectedSkills.slice(0, 4).map(s => s.skillName).join(', ')}...) with an assessed level of **${profileData.experienceLevel}**.\n\nWould you like me to run a Skill Gap Audit against your target role of **${userProfile.targetRoleTitle}** next?`;
  } else if (classified.intent === 'skill_gap_audit') {
    const sStart = Date.now();
    const userSkills = contextData.skills || [
      { skillName: 'JavaScript', evidenceState: 'CLAIMED' },
      { skillName: 'React', evidenceState: 'CLAIMED' }
    ];

    const audit = await auditSkillGaps(userProfile.targetRoleId, userSkills as any);
    agentLogs.push({
      id: `log-skill-${Date.now()}`,
      agent: 'Agent 3: Skill Intelligence Agent',
      role: 'Evidence & Gap Auditor',
      objective: 'Compute evidence vectors vs market requirements',
      status: 'completed',
      modelUsed: 'gemini-4-argon (ThinkingLevel.HIGH)',
      durationMs: Date.now() - sStart,
      timestamp: new Date().toISOString(),
      outputSummary: `Computed ${audit.totalGapsIdentified} gaps (${audit.criticalGaps.length} critical).`
    });

    stateUpdates.skillAudit = audit;
    responseText = `### 📊 Skill Intelligence Report: ${audit.targetRole}\n\n**Agent 3 (Skill Intelligence Agent)** evaluated your profile against live market benchmarks:\n\n- **Critical Missing Evidence:** ${audit.criticalGaps.map(g => g.skill).join(', ') || 'None'}\n- **Skills Needing Project Proof:** ${audit.highGaps.map(g => g.skill).join(', ') || 'None'}\n\n💡 **Recommended Proof Strategy:**\n${audit.recommendedProofStrategy}\n\nCheck the **Skill Intelligence** tab to submit evidence or view the detailed gap matrix.`;
  } else if (classified.intent === 'roadmap_generation') {
    const rStart = Date.now();
    const userSkills = contextData.skills || [];
    const gaps = await auditSkillGaps(userProfile.targetRoleId, userSkills as any);
    const plan = await generateLearningRoadmap(
      userId,
      userProfile.targetRoleTitle,
      userProfile.dailyHours * 7,
      gaps.criticalGaps.concat(gaps.highGaps),
      8
    );

    agentLogs.push({
      id: `log-plan-${Date.now()}`,
      agent: 'Agent 4: Learning Planner Agent',
      role: 'Curriculum & Milestone Architect',
      objective: 'Generate personalized weekly plan',
      status: 'completed',
      modelUsed: 'gemini-3.8-flash',
      durationMs: Date.now() - rStart,
      timestamp: new Date().toISOString(),
      outputSummary: `Generated ${plan.totalWeeks}-week plan with ${plan.tasks.length} milestones.`
    });

    stateUpdates.newPlan = plan;
    responseText = `🎯 **Agent 4 (Learning Planner)** has generated a custom **${plan.totalWeeks}-week learning roadmap** for **${userProfile.targetRoleTitle}** calibrated to **${userProfile.dailyHours} hours/day**.\n\n- **Week 1 Focus:** ${plan.tasks[0]?.title}\n- **First Deliverable:** ${plan.tasks[0]?.description}\n\nVisit the **Learning Roadmap** tab to track your weekly milestones or check off completed tasks.`;
  } else if (classified.intent === 'portfolio_recommendation') {
    const pStart = Date.now();
    const userSkills = contextData.skills || [];
    const gaps = await auditSkillGaps(userProfile.targetRoleId, userSkills as any);
    const projects = await recommendPortfolioProjects(userId, userProfile.targetRoleTitle, gaps.criticalGaps);

    agentLogs.push({
      id: `log-proj-${Date.now()}`,
      agent: 'Agent 5: Portfolio Project Agent',
      role: 'Practical Deliverables Architect',
      objective: 'Recommend proof-generating projects',
      status: 'completed',
      modelUsed: 'gemini-3.8-flash',
      durationMs: Date.now() - pStart,
      timestamp: new Date().toISOString(),
      outputSummary: `Recommended ${projects.length} portfolio deliverables.`
    });

    stateUpdates.recommendedProjects = projects;
    responseText = `🛠️ **Agent 5 (Portfolio Project Agent)** recommended **${projects.length} production-grade projects** specifically tailored to bridge your skill gaps for **${userProfile.targetRoleTitle}**:\n\n1. **${projects[0]?.title}** (${projects[0]?.difficulty})\n   - ${projects[0]?.description}\n2. **${projects[1]?.title}** (${projects[1]?.difficulty})\n   - ${projects[1]?.description}\n\nHead over to the **Portfolio Studio** tab to start tracking deliverables and submit your GitHub repositories!`;
  } else if (classified.intent === 'progress_adaptation') {
    const aStart = Date.now();
    const adaptation = await evaluateProgressAndAdapt(
      userProfile,
      contextData.learningPlan,
      contextData.recentEvidence || [],
      []
    );

    agentLogs.push({
      id: `log-prog-${Date.now()}`,
      agent: 'Agent 8: Progress & Adaptation Agent',
      role: 'Continuous Feedback Engine',
      objective: 'Analyze progress & formulate adaptation proposal',
      status: 'completed',
      modelUsed: 'gemini-4-argon (ThinkingLevel.HIGH)',
      durationMs: Date.now() - aStart,
      timestamp: new Date().toISOString(),
      outputSummary: `Adaptation status: ${adaptation.needsRevision ? 'Revision Recommended' : 'Pace Optimal'}`
    });

    requiresApproval = adaptation.requiresApproval;
    approvalPayload = adaptation;
    responseText = `🔄 **Agent 8 (Progress & Adaptation Agent)** evaluated your recent momentum:\n\n**Diagnostic Insight:** ${adaptation.rationale}\n\n**Proposed Adjustment:**\n${adaptation.proposedChanges}\n\nWould you like to approve this roadmap adaptation?`;
  } else {
    // General guidance synthesized by Orchestrator
    const gStart = Date.now();
    const sysPrompt = `You are the Lead Career AI Orchestrator for PROOFPATH.
Target role: ${userProfile.targetRoleTitle} (${userProfile.targetFamily}).
User Experience: ${userProfile.experienceLevel}.
Explain how the user can progress through ProofPath's evidence-based career development system.
Keep your response concise, empowering, and actionable.`;

    responseText = await generateGeneral(sysPrompt, userMessage);

    agentLogs.push({
      id: `log-guidance-${Date.now()}`,
      agent: 'Agent 0: Career Orchestrator',
      role: 'Assistant & System Guide',
      objective: 'Provide contextual guidance',
      status: 'completed',
      modelUsed: 'gemini-3.8-flash',
      durationMs: Date.now() - gStart,
      timestamp: new Date().toISOString(),
      outputSummary: 'Answered user query with contextual career operating guidance.'
    });
  }

  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
    agentTrace: {
      orchestratorRoute: classified.intent,
      specialistsInvoked: agentLogs.map(l => l.agent),
      thinkingDurationMs: Date.now() - startTime,
      actionRequired: requiresApproval,
      actionType: requiresApproval ? 'ROADMAP_REVISION_APPROVAL' : undefined
    }
  };

  return {
    message,
    agentLogs,
    stateUpdates,
    requiresApproval,
    approvalPayload
  };
}
