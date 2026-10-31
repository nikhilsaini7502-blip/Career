import { generateGeneral, extractJsonFromText } from '../services/gemini';
import { PortfolioProject, SkillGapItem } from '../../src/types/career';

export async function recommendPortfolioProjects(
  userId: string,
  targetRole: string,
  skillGaps: SkillGapItem[]
): Promise<PortfolioProject[]> {
  const gapsList = skillGaps.slice(0, 4).map(g => g.skill).join(', ');

  const systemInstruction = `You are Agent 5: Portfolio Project Agent for PROOFPATH.
Recommend 2 distinct, highly practical portfolio projects that directly demonstrate proficiency in: ${gapsList || 'Core Tech Requirements'} for a ${targetRole} role.
Do NOT recommend trivial or toy projects (like simple to-do lists).
Each project must have concrete, demonstrable deliverables that an employer or technical recruiter can inspect.
Return ONLY valid JSON matching:
[
  {
    "title": string,
    "description": string,
    "skillsCovered": string[],
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "estimatedHours": number,
    "deliverables": string[]
  }
]`;

  const prompt = `Recommend 2 rigorous portfolio projects tailored to candidate targeting ${targetRole} to bridge: ${gapsList}`;

  const raw = await generateGeneral(systemInstruction, prompt);

  const fallback: Array<Omit<PortfolioProject, 'id' | 'userId' | 'status' | 'verifiedEvidence' | 'createdAt'>> = [
    {
      title: `${targetRole} Production Benchmark Pipeline`,
      description: `Architect a scalable, end-to-end implementation solving realistic domain workflows, featuring automated tests and CI/CD.`,
      skillsCovered: skillGaps.slice(0, 3).map(g => g.skill),
      difficulty: 'Intermediate',
      estimatedHours: 24,
      deliverables: [
        'GitHub repository with clear README, architecture diagram, and setup instructions',
        'Automated unit & integration test suite with coverage report',
        'Live deployment URL or containerized Docker Compose setup'
      ]
    },
    {
      title: `High-Throughput ${targetRole} Service with Telemetry`,
      description: `Build an enterprise-grade service integrating monitoring, structured logging, rate limiting, and database caching.`,
      skillsCovered: skillGaps.slice(1, 4).map(g => g.skill),
      difficulty: 'Advanced',
      estimatedHours: 35,
      deliverables: [
        'Repository with benchmark metrics and load testing scripts',
        'Comprehensive API documentation (Swagger/OpenAPI)',
        'Recorded video walkthrough explaining system tradeoffs'
      ]
    }
  ];

  const parsed = extractJsonFromText<typeof fallback>(raw, fallback);

  return parsed.map((p, idx) => ({
    id: `project-${Date.now()}-${idx}`,
    userId,
    title: p.title,
    description: p.description,
    skillsCovered: p.skillsCovered || [],
    difficulty: p.difficulty || 'Intermediate',
    estimatedHours: p.estimatedHours || 20,
    status: 'recommended',
    deliverables: p.deliverables || ['Repository link', 'Architecture docs'],
    verifiedEvidence: false,
    createdAt: new Date().toISOString()
  }));
}
