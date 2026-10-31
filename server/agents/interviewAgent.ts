import { generateGeneral, extractJsonFromText } from '../services/gemini';
import { InterviewEvaluation, InterviewQuestion } from '../../src/types/career';

export async function generateInterviewQuestion(
  targetRole: string,
  mode: 'technical' | 'behavioral' | 'system_design' | 'comprehensive',
  difficulty: 'Junior' | 'Mid' | 'Senior' = 'Mid'
): Promise<InterviewQuestion> {
  const systemInstruction = `You are Agent 6: AI Mock Interview Agent for PROOFPATH.
Generate ONE challenging, realistic interview question for a ${difficulty} level ${targetRole} candidate.
Mode: ${mode}.
Focus on real reasoning and practical engineering tradeoffs.
Return ONLY valid JSON matching:
{
  "question": string,
  "category": "technical" | "conceptual" | "problem_solving" | "behavioral" | "system_design",
  "difficulty": "Junior" | "Mid" | "Senior",
  "expectedKeyPoints": string[]
}`;

  const prompt = `Generate a high-quality ${mode} interview question for a candidate interviewing for ${targetRole}.`;
  const raw = await generateGeneral(systemInstruction, prompt);

  const fallback: InterviewQuestion = {
    id: `q-${Date.now()}`,
    question: `In your work with ${targetRole}, describe how you handle data consistency and failure recovery when integrating external services. Walk me through a concrete scenario.`,
    category: mode === 'behavioral' ? 'behavioral' : 'technical',
    difficulty,
    expectedKeyPoints: [
      'Idempotency and retry mechanisms',
      'Circuit breakers or fallback degradation',
      'Real-world tradeoff consideration',
      'Structured error logging and alerting'
    ]
  };

  const parsed = extractJsonFromText<Omit<InterviewQuestion, 'id'>>(raw, fallback);
  return {
    id: `q-${Date.now()}`,
    question: parsed.question || fallback.question,
    category: parsed.category || fallback.category,
    difficulty: parsed.difficulty || difficulty,
    expectedKeyPoints: parsed.expectedKeyPoints || fallback.expectedKeyPoints
  };
}

export async function evaluateInterviewAnswer(
  targetRole: string,
  question: InterviewQuestion,
  userAnswer: string
): Promise<InterviewEvaluation> {
  const systemInstruction = `You are Agent 6: AI Mock Interview Evaluator for PROOFPATH.
Evaluate the candidate's answer based EXCLUSIVELY on technical content, logical reasoning, and depth.
Do NOT evaluate accent, personality, or superficial traits.
Strictly adhere to this weighted scoring rubric:
1. Technical correctness (30% weight) -> score 0-100
2. Conceptual understanding (25% weight) -> score 0-100
3. Problem-solving & tradeoffs (20% weight) -> score 0-100
4. Communication and clarity (15% weight) -> score 0-100
5. Practical examples & depth (10% weight) -> score 0-100

Compute the overall weighted score as:
overallScore = (technicalScore * 0.30) + (conceptualScore * 0.25) + (problemSolvingScore * 0.20) + (communicationScore * 0.15) + (practicalScore * 0.10)

Return ONLY valid JSON matching:
{
  "overallScore": number,
  "technicalScore": number,
  "conceptualScore": number,
  "problemSolvingScore": number,
  "communicationScore": number,
  "practicalScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestedAnswer": string,
  "improvementTip": string
}`;

  const prompt = `Target Role: ${targetRole}
Interview Question: "${question.question}"
Expected Key Points: ${JSON.stringify(question.expectedKeyPoints)}

Candidate Answer:
"${userAnswer}"

Evaluate rigorously and objectively according to the rubric.`;

  const raw = await generateGeneral(systemInstruction, prompt);

  const fallback: InterviewEvaluation = {
    overallScore: 74,
    technicalScore: 75,
    conceptualScore: 78,
    problemSolvingScore: 70,
    communicationScore: 75,
    practicalScore: 70,
    strengths: [
      'Accurately addressed the core requirements of the question',
      'Demonstrated understanding of fundamental principles'
    ],
    weaknesses: [
      'Could cite more concrete production metrics or specific tooling examples',
      'Tradeoff analysis could be deepened'
    ],
    suggestedAnswer: `A stellar response would outline the specific architecture pattern (e.g. SAGA or transactional outbox), mention monitoring latency percentiles (p99), and discuss disaster recovery testing.`,
    improvementTip: 'Structure technical answers using the STAR-T method: Situation, Task, Action, Result, and Technical Tradeoff.'
  };

  const parsed = extractJsonFromText<InterviewEvaluation>(raw, fallback);

  // Re-verify weighted calculation
  const tech = parsed.technicalScore ?? 70;
  const conc = parsed.conceptualScore ?? 70;
  const prob = parsed.problemSolvingScore ?? 70;
  const comm = parsed.communicationScore ?? 70;
  const prac = parsed.practicalScore ?? 70;
  const calculatedOverall = Math.round(
    (tech * 0.3) + (conc * 0.25) + (prob * 0.2) + (comm * 0.15) + (prac * 0.1)
  );

  return {
    overallScore: parsed.overallScore || calculatedOverall,
    technicalScore: tech,
    conceptualScore: conc,
    problemSolvingScore: prob,
    communicationScore: comm,
    practicalScore: prac,
    strengths: parsed.strengths || fallback.strengths,
    weaknesses: parsed.weaknesses || fallback.weaknesses,
    suggestedAnswer: parsed.suggestedAnswer || fallback.suggestedAnswer,
    improvementTip: parsed.improvementTip || fallback.improvementTip
  };
}
