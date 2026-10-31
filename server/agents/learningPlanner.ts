import { generateGeneral, extractJsonFromText } from '../services/gemini';
import { LearningPlan, LearningTask, SkillGapItem } from '../../src/types/career';

export async function generateLearningRoadmap(
  userId: string,
  roleTitle: string,
  weeklyHours: number,
  skillGaps: SkillGapItem[],
  desiredDurationWeeks: number = 8
): Promise<LearningPlan> {
  const topGaps = skillGaps.slice(0, 5).map(g => g.skill).join(', ');

  const systemInstruction = `You are Agent 4: Learning Planner Agent for PROOFPATH.
Your task is to create a realistic, personalized ${desiredDurationWeeks}-week learning roadmap.
Candidate has ${weeklyHours} hours per week available.
Target role: ${roleTitle}.
Top skill gaps to bridge: ${topGaps || 'Foundational competencies'}.

Never create an unrealistic workload. Break down into concrete, actionable daily/weekly tasks with real-world deliverables and checkpoints.
Return ONLY valid JSON matching this schema:
{
  "totalWeeks": number,
  "tasks": [
    {
      "weekNumber": number,
      "dayNumber": number,
      "title": string,
      "description": string,
      "skillAddressed": string,
      "estimatedMinutes": number,
      "resourceTitle": string,
      "resourceUrl": string
    }
  ]
}`;

  const prompt = `Generate a rigorous ${desiredDurationWeeks}-week learning roadmap for ${roleTitle} with ${weeklyHours} hours/week. Focus on bridging: ${topGaps}. Include 2-3 tasks per week.`;

  const raw = await generateGeneral(systemInstruction, prompt);

  const fallbackTasks: Array<Omit<LearningTask, 'id' | 'completed'>> = [
    {
      weekNumber: 1,
      dayNumber: 1,
      title: 'Environment & Core Architecture Setup',
      description: `Review fundamental conventions, project layout, and toolchains for ${roleTitle}.`,
      skillAddressed: skillGaps[0]?.skill || 'Core Architecture',
      estimatedMinutes: 90,
      resourceTitle: 'Official Documentation & Architecture Guide',
      resourceUrl: 'https://developer.mozilla.org'
    },
    {
      weekNumber: 1,
      dayNumber: 3,
      title: 'Hands-on Implementation Drill',
      description: 'Implement a minimal working module verifying basic mechanics.',
      skillAddressed: skillGaps[0]?.skill || 'Core Architecture',
      estimatedMinutes: 120,
      resourceTitle: 'Interactive Coding Labs',
      resourceUrl: 'https://github.com'
    },
    {
      weekNumber: 2,
      dayNumber: 1,
      title: 'Intermediate Concepts & State Flow',
      description: `Deep dive into advanced paradigms required by ${roleTitle}.`,
      skillAddressed: skillGaps[1]?.skill || 'Advanced Patterns',
      estimatedMinutes: 100,
      resourceTitle: 'Advanced Architectural Patterns',
      resourceUrl: 'https://web.dev'
    },
    {
      weekNumber: 2,
      dayNumber: 4,
      title: 'Milestone Assessment Checkpoint',
      description: 'Build a practical mini-deliverable to produce DEMONSTRATED proof.',
      skillAddressed: skillGaps[1]?.skill || 'Advanced Patterns',
      estimatedMinutes: 150,
      resourceTitle: 'PROOFPATH Checkpoint Evaluator',
      resourceUrl: 'https://github.com'
    }
  ];

  const parsed = extractJsonFromText<{ totalWeeks: number; tasks: Array<Omit<LearningTask, 'id' | 'completed'>> }>(
    raw,
    { totalWeeks: desiredDurationWeeks, tasks: fallbackTasks }
  );

  const hydratedTasks: LearningTask[] = (parsed.tasks || fallbackTasks).map((t, idx) => ({
    id: `task-${Date.now()}-${idx}`,
    weekNumber: t.weekNumber || Math.floor(idx / 2) + 1,
    dayNumber: t.dayNumber || (idx % 2 === 0 ? 1 : 3),
    title: t.title,
    description: t.description,
    skillAddressed: t.skillAddressed,
    estimatedMinutes: t.estimatedMinutes || 90,
    completed: false,
    resourceTitle: t.resourceTitle || 'Resource Guide',
    resourceUrl: t.resourceUrl || 'https://google.com'
  }));

  return {
    id: `plan-${Date.now()}`,
    userId,
    roleTitle,
    totalWeeks: parsed.totalWeeks || desiredDurationWeeks,
    currentWeek: 1,
    status: 'active',
    weeklyHours,
    tasks: hydratedTasks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
