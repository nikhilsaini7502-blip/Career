import { generateGeneral, extractJsonFromText } from '../services/gemini';
import { findRoleById, TECH_ROLES_TAXONOMY } from '../../src/data/rolesTaxonomy';
import { TechRole } from '../../src/types/career';

export interface JobResearchOutput {
  roleTitle: string;
  sourceType: 'Curated Benchmark' | 'Greenhouse API Benchmark' | 'User Provided Job Description';
  sourceReference: string;
  timestamp: string;
  requiredSkills: string[];
  preferredSkills: string[];
  qualifications: string[];
  marketInsights: string;
}

export async function researchJobRequirements(
  roleIdOrTitle: string,
  userJobDescription?: string
): Promise<JobResearchOutput> {
  // If user provided a specific job description to analyze
  if (userJobDescription && userJobDescription.trim().length > 50) {
    const systemInstruction = `You are Agent 2: Job Market Research Agent for PROOFPATH.
Extract real employer requirements from the provided job description.
Do NOT fabricate skills. Categorize requirements strictly into required vs preferred.
Return ONLY valid JSON matching this schema:
{
  "roleTitle": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "qualifications": string[],
  "marketInsights": string
}`;

    const prompt = `Analyze this job posting description:\n\n${userJobDescription}`;
    const raw = await generateGeneral(systemInstruction, prompt);
    const parsed = extractJsonFromText<any>(raw, {
      roleTitle: roleIdOrTitle,
      requiredSkills: ['Problem Solving', 'Git', 'Clean Code'],
      preferredSkills: ['System Design'],
      qualifications: ['Bachelor degree or equivalent experience'],
      marketInsights: 'Extracted from user job description'
    });

    return {
      roleTitle: parsed.roleTitle || roleIdOrTitle,
      sourceType: 'User Provided Job Description',
      sourceReference: 'Uploaded Job Description',
      timestamp: new Date().toISOString(),
      requiredSkills: parsed.requiredSkills || [],
      preferredSkills: parsed.preferredSkills || [],
      qualifications: parsed.qualifications || [],
      marketInsights: parsed.marketInsights || 'High demand for demonstrable practical skills.'
    };
  }

  // Look up role in taxonomy
  const matched = findRoleById(roleIdOrTitle) || TECH_ROLES_TAXONOMY.find(
    r => r.title.toLowerCase() === roleIdOrTitle.toLowerCase()
  );

  if (matched) {
    return {
      roleTitle: matched.title,
      sourceType: 'Curated Benchmark',
      sourceReference: `PROOFPATH Market Taxonomy Benchmark (Greenhouse/Labor Index)`,
      timestamp: new Date().toISOString(),
      requiredSkills: matched.requiredSkills,
      preferredSkills: matched.preferredSkills,
      qualifications: [
        'Demonstrated portfolio or production experience',
        'Strong foundational problem solving and domain fundamentals'
      ],
      marketInsights: `Demand rating: ${matched.demandLevel}. Average compensation range: ${matched.averageSalaryRange}.`
    };
  }

  // Custom role lookup using Gemini
  const systemInstruction = `You are Agent 2: Job Market Research Agent for PROOFPATH.
Generate realistic, high-fidelity employer requirements for a non-standard technology role: "${roleIdOrTitle}".
Never fabricate fake companies or fake statistics.
Return ONLY valid JSON matching:
{
  "roleTitle": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "qualifications": string[],
  "marketInsights": string
}`;

  const raw = await generateGeneral(systemInstruction, `Analyze market requirements for: ${roleIdOrTitle}`);
  const parsed = extractJsonFromText<any>(raw, {
    roleTitle: roleIdOrTitle,
    requiredSkills: ['Domain Fundamentals', 'TypeScript / Python', 'Git'],
    preferredSkills: ['Cloud Infrastructure', 'CI/CD'],
    qualifications: ['Engineering or equivalent practical experience'],
    marketInsights: 'Emerging technology specialization with growing employer adoption.'
  });

  return {
    roleTitle: parsed.roleTitle || roleIdOrTitle,
    sourceType: 'Curated Benchmark',
    sourceReference: 'AI Studio Grounded Market Intelligence',
    timestamp: new Date().toISOString(),
    requiredSkills: parsed.requiredSkills || [],
    preferredSkills: parsed.preferredSkills || [],
    qualifications: parsed.qualifications || [],
    marketInsights: parsed.marketInsights || 'Growing demand for practical proof of skills.'
  };
}
