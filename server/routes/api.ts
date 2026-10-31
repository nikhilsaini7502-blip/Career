import { Router, Request, Response } from 'express';
import { TECH_ROLES_TAXONOMY, findRoleById } from '../../src/data/rolesTaxonomy';
import { processUserIntent } from '../agents/orchestrator';
import { parseResumeOrText } from '../agents/profileAgent';
import { researchJobRequirements } from '../agents/jobResearchAgent';
import { auditSkillGaps } from '../agents/skillIntelAgent';
import { generateLearningRoadmap } from '../agents/learningPlanner';
import { recommendPortfolioProjects } from '../agents/portfolioAgent';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../agents/interviewAgent';
import { auditApplications } from '../agents/applicationAgent';
import { evaluateProgressAndAdapt } from '../agents/progressAgent';
import { calculateCareerReadiness } from '../../src/utils/evidenceEngine';
import { UserProfile } from '../../src/types/career';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    product: 'PROOFPATH',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Roles catalogue endpoint
apiRouter.get('/roles', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const family = req.query.family as string;

  let roles = TECH_ROLES_TAXONOMY;
  if (family) {
    roles = roles.filter(r => r.family === family);
  }
  if (query) {
    roles = roles.filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.requiredSkills.some(s => s.toLowerCase().includes(query))
    );
  }

  res.json({ roles, total: roles.length });
});

// Single role details
apiRouter.get('/roles/:id', (req: Request, res: Response) => {
  const role = findRoleById(req.params.id);
  if (!role) {
    return res.status(404).json({ error: 'Role not found in taxonomy' });
  }
  res.json(role);
});

// Job Research endpoint (live market requirements)
apiRouter.post('/jobs/research', async (req: Request, res: Response) => {
  try {
    const { roleIdOrTitle, jobDescription } = req.body;
    const requirements = await researchJobRequirements(roleIdOrTitle || 'full-stack-developer', jobDescription);
    res.json(requirements);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Job research agent failed' });
  }
});

// Parse Resume / Career text
apiRouter.post('/resume/parse', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required for resume parsing' });
    }
    const extracted = await parseResumeOrText(content);
    res.json(extracted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// Multi-Agent Chat Endpoint (Wispr Flow compatible)
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId, message, profile, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const defaultProfile: UserProfile = {
      uid: userId || 'guest-user',
      displayName: 'Career Builder',
      email: 'user@proofpath.ai',
      targetRoleId: 'full-stack-developer',
      targetRoleTitle: 'Full Stack Developer',
      targetFamily: 'Software Engineering',
      experienceLevel: 'Entry Level (0-2y)',
      dailyHours: 2,
      readinessScore: 35,
      updatedAt: new Date().toISOString()
    };

    const effectiveProfile: UserProfile = { ...defaultProfile, ...(profile || {}) };
    const result = await processUserIntent(
      userId || 'guest-user',
      message,
      effectiveProfile,
      context || {}
    );

    res.json(result);
  } catch (err: any) {
    console.error('Chat orchestration failed:', err);
    res.status(500).json({ error: err.message || 'Orchestrator error' });
  }
});

// Skill Gap Audit
apiRouter.post('/skills/audit', async (req: Request, res: Response) => {
  try {
    const { targetRoleId, userSkills } = req.body;
    const audit = await auditSkillGaps(targetRoleId || 'full-stack-developer', userSkills || []);
    res.json(audit);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Skill audit failed' });
  }
});

// Generate Learning Roadmap
apiRouter.post('/roadmap/generate', async (req: Request, res: Response) => {
  try {
    const { userId, roleTitle, weeklyHours, skillGaps, totalWeeks } = req.body;
    const plan = await generateLearningRoadmap(
      userId || 'user-1',
      roleTitle || 'Full Stack Developer',
      weeklyHours || 14,
      skillGaps || [],
      totalWeeks || 8
    );
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Roadmap generation failed' });
  }
});

// Recommend Portfolio Projects
apiRouter.post('/projects/recommend', async (req: Request, res: Response) => {
  try {
    const { userId, targetRole, skillGaps } = req.body;
    const projects = await recommendPortfolioProjects(
      userId || 'user-1',
      targetRole || 'Full Stack Developer',
      skillGaps || []
    );
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Project recommendation failed' });
  }
});

// Start Mock Interview Session (Agent 6)
apiRouter.post('/interviews/start', async (req: Request, res: Response) => {
  try {
    const { targetRole, mode, difficulty } = req.body;
    const question = await generateInterviewQuestion(
      targetRole || 'Full Stack Developer',
      mode || 'technical',
      difficulty || 'Mid'
    );
    res.json(question);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate interview question' });
  }
});

// Evaluate Mock Interview Answer (Agent 6 Rubric)
apiRouter.post('/interviews/evaluate', async (req: Request, res: Response) => {
  try {
    const { targetRole, question, userAnswer } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and userAnswer are required' });
    }
    const evaluation = await evaluateInterviewAnswer(
      targetRole || 'Full Stack Developer',
      question,
      userAnswer
    );
    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to evaluate interview answer' });
  }
});

// Application Funnel Audit (Agent 7)
apiRouter.post('/applications/audit', async (req: Request, res: Response) => {
  try {
    const { applications, skillGaps, targetRole } = req.body;
    const audit = await auditApplications(
      applications || [],
      skillGaps || [],
      targetRole || 'Full Stack Developer'
    );
    res.json(audit);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Application audit failed' });
  }
});

// Progress Adaptation Check (Agent 8)
apiRouter.post('/progress/adapt', async (req: Request, res: Response) => {
  try {
    const { profile, learningPlan, recentEvidence, currentGaps } = req.body;
    const proposal = await evaluateProgressAndAdapt(
      profile,
      learningPlan,
      recentEvidence || [],
      currentGaps || []
    );
    res.json(proposal);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Progress adaptation check failed' });
  }
});

// Career Readiness Score Calculation (Evidence Engine)
apiRouter.post('/readiness/calculate', (req: Request, res: Response) => {
  try {
    const { userSkills, targetRoleId } = req.body;
    const role = findRoleById(targetRoleId) || TECH_ROLES_TAXONOMY[0];
    const readiness = calculateCareerReadiness(userSkills || [], role);
    res.json(readiness);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Readiness calculation failed' });
  }
});
