import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCareerReadiness, computeSkillGaps, normalizeSkillName, EVIDENCE_WEIGHTS } from '../utils/evidenceEngine';
import { TechRole } from '../types/career';

const mockFrontendRole: TechRole = {
  id: 'frontend-developer',
  title: 'Frontend Developer',
  family: 'Software Engineering',
  demandLevel: 'Very High',
  averageSalaryRange: '$85,000 - $135,000',
  description: 'Frontend role',
  requiredSkills: ['JavaScript / TypeScript', 'React / Next.js', 'CSS / Tailwind CSS'],
  preferredSkills: ['Performance Optimization', 'Jest / Vitest']
};

test('normalizeSkillName standardizes variations', () => {
  assert.equal(normalizeSkillName('React.js'), 'react');
  assert.equal(normalizeSkillName('TypeScript'), 'typescript');
  assert.equal(normalizeSkillName('Docker'), 'docker');
});

test('calculateCareerReadiness gives 0 for empty skills', () => {
  const result = calculateCareerReadiness([], mockFrontendRole);
  assert.equal(result.overallScore, 0);
  assert.equal(result.requiredSkillsCovered, 0);
  assert.equal(result.totalRequiredSkills, 3);
});

test('calculateCareerReadiness weighs evidence stages properly', () => {
  // If user only has CLAIMED skills
  const claimedSkills = [
    { skillName: 'JavaScript / TypeScript', evidenceState: 'CLAIMED' as const },
    { skillName: 'React / Next.js', evidenceState: 'CLAIMED' as const },
    { skillName: 'CSS / Tailwind CSS', evidenceState: 'CLAIMED' as const }
  ];
  const claimedResult = calculateCareerReadiness(claimedSkills, mockFrontendRole);
  assert.equal(claimedResult.requiredSkillsCovered, 3);
  // (3 * 0.25 / 3) * 100 * 0.75 = 18.75 ~ 19%
  assert.ok(claimedResult.overallScore >= 18 && claimedResult.overallScore <= 20);

  // If user has APPLIED and INTERVIEW_DEMONSTRATED
  const strongSkills = [
    { skillName: 'JavaScript / TypeScript', evidenceState: 'INTERVIEW_DEMONSTRATED' as const },
    { skillName: 'React / Next.js', evidenceState: 'APPLIED' as const },
    { skillName: 'CSS / Tailwind CSS', evidenceState: 'DEMONSTRATED' as const },
    { skillName: 'Performance Optimization', evidenceState: 'APPLIED' as const }
  ];
  const strongResult = calculateCareerReadiness(strongSkills, mockFrontendRole);
  assert.ok(strongResult.overallScore > 65);
});

test('computeSkillGaps correctly surfaces missing skills and recommends actions', () => {
  const partialSkills = [
    { skillName: 'React / Next.js', evidenceState: 'APPLIED' as const }
  ];
  const gaps = computeSkillGaps(partialSkills, mockFrontendRole);
  assert.ok(gaps.length >= 2);
  const jsGap = gaps.find(g => g.skill === 'JavaScript / TypeScript');
  assert.ok(jsGap);
  assert.equal(jsGap.importance, 'Critical');
});

test('generateJobMatchesForRole produces scored opportunities with matched and gap skills', async () => {
  const { generateJobMatchesForRole } = await import('../utils/jobMatchEngine.js');
  const userSkills = [
    { skillName: 'React / Next.js', evidenceState: 'APPLIED' as const },
    { skillName: 'CSS / Tailwind CSS', evidenceState: 'DEMONSTRATED' as const }
  ];
  const matches = generateJobMatchesForRole(mockFrontendRole, userSkills);
  assert.ok(matches.length >= 3);
  const first = matches[0];
  assert.ok(first.matchScore >= 45 && first.matchScore <= 100);
  assert.ok(first.company);
  assert.ok(first.matchedSkills.length > 0);
  assert.ok(Array.isArray(first.missingSkills));
});

test('calculateResumeAtsScore accurately evaluates keyword density and quantified metrics', async () => {
  const { calculateResumeAtsScore } = await import('../utils/atsEngine.js');
  const userSkills = [
    { skillName: 'React / Next.js', evidenceState: 'APPLIED' as const }
  ];
  
  // High impact resume with metrics and keywords
  const goodResume = `
    Experience: Senior Frontend Engineer at TechCorp.
    - Led React / Next.js application development, improving page speed by 42%.
    - Scaled TypeScript design system to 25+ teams and reduced bundle size by 35%.
    - Deployed CSS / Tailwind CSS architectures serving 100k daily active users.
    Education: B.S. in Computer Science.
  `;
  const result = calculateResumeAtsScore(goodResume, userSkills, mockFrontendRole);
  assert.ok(result.overallScore >= 80);
  assert.ok(result.quantifiedImpactScore >= 70);
  assert.ok(result.keywordMatchScore >= 60);
  assert.ok(result.strengths.length > 0);

  // Sparse resume lacking metrics
  const weakResume = `Just worked on some web pages.`;
  const weakResult = calculateResumeAtsScore(weakResume, [], mockFrontendRole);
  assert.ok(weakResult.overallScore < result.overallScore);
  assert.ok(weakResult.improvements.length > 0);
});
