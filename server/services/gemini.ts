import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const MODELS = {
  FAST: 'gemini-2.5-flash',
  GENERAL: 'gemini-2.5-flash',
  DEEP_THINKING: 'gemini-2.5-pro'
} as const;

/**
 * Execute deep reasoning query using gemini-4-argon and high thinking
 */
export async function generateDeepReasoning(systemInstruction: string, prompt: string): Promise<string> {
  if (!ai) {
    return mockDeepReasoningFallback(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: MODELS.DEEP_THINKING,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    return response.text || '';
  } catch (err) {
    console.warn('Gemini 4 Argon call failed, falling back to Flash:', err);
    return generateGeneral(systemInstruction, prompt);
  }
}

/**
 * Execute general reasoning query using gemini-3.8-flash
 */
export async function generateGeneral(systemInstruction: string, prompt: string): Promise<string> {
  if (!ai) {
    return mockGeneralFallback(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: MODELS.GENERAL,
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    return response.text || '';
  } catch (err) {
    console.warn('Gemini 3.8 Flash call failed, falling back to fast model:', err);
    return generateFast(systemInstruction, prompt);
  }
}

/**
 * Fast tactical task using gemini-3.1-flash-lite
 */
export async function generateFast(systemInstruction: string, prompt: string): Promise<string> {
  if (!ai) {
    return mockFastFallback(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: MODELS.FAST,
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    return response.text || '';
  } catch (err) {
    console.warn('Gemini Fast call failed:', err);
    return mockFastFallback(prompt);
  }
}

/**
 * Safe JSON extraction from model output (handles Markdown code fences)
 */
export function extractJsonFromText<T>(text: string, fallback: T): T {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (e) {
    console.warn('Failed to parse JSON from response text:', text.slice(0, 200));
    return fallback;
  }
}

function mockDeepReasoningFallback(prompt: string): string {
  return JSON.stringify({
    analysis: `Deep analysis conducted for request: "${prompt.slice(0, 80)}..."`,
    status: 'completed',
    insights: ['Identified core evidence gap in practical system design', 'Recommended prioritizing hands-on pipeline project']
  });
}

function mockGeneralFallback(prompt: string): string {
  return `PROOFPATH Agent response for: ${prompt.slice(0, 80)}. System evaluated profile and updated career state.`;
}

function mockFastFallback(prompt: string): string {
  return JSON.stringify({ intent: 'career_analysis', routedAgent: 'skill_intelligence' });
}
