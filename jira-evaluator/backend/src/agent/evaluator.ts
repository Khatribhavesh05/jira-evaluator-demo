import { GoogleGenAI } from '@google/genai';
import { JiraTicket, GitHubPR, EvaluationResult, Requirement } from '../types/index';
import { SYSTEM_PROMPT, buildEvaluationPrompt } from './prompts';

/**
 * Validates and sanitizes the raw JSON response from Gemini.
 * Ensures the response matches the EvaluationResult schema.
 */
function parseGeminiResponse(
  raw: string,
  jiraTicketId: string,
  prUrl: string
): EvaluationResult {
  // Strip any accidental markdown code fences
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Gemini returned invalid JSON. Raw response (first 500 chars): ${raw.substring(0, 500)}`
    );
  }

  // Validate overallVerdict
  const validVerdicts = ['Pass', 'Partial', 'Fail'];
  if (!validVerdicts.includes(parsed.overallVerdict as string)) {
    throw new Error(
      `Invalid overallVerdict: "${parsed.overallVerdict}". Expected Pass, Partial, or Fail.`
    );
  }

  // Validate confidence
  const confidence = Number(parsed.confidence);
  if (isNaN(confidence) || confidence < 0 || confidence > 100) {
    throw new Error(`Invalid confidence score: ${parsed.confidence}`);
  }

  // Validate and map requirements
  if (!Array.isArray(parsed.requirements) || parsed.requirements.length === 0) {
    throw new Error('Response missing "requirements" array.');
  }

  const requirements: Requirement[] = (
    parsed.requirements as Record<string, unknown>[]
  ).map((req, index) => {
    if (!['Pass', 'Fail'].includes(req.verdict as string)) {
      req.verdict = 'Fail'; // default to Fail if invalid
    }

    return {
      id: typeof req.id === 'number' ? req.id : index + 1,
      description: String(req.description || `Requirement ${index + 1}`),
      verdict: req.verdict as 'Pass' | 'Fail',
      evidence: String(req.evidence || 'No evidence provided.'),
      fileReferences: Array.isArray(req.fileReferences)
        ? (req.fileReferences as string[]).filter(
            (f) => typeof f === 'string'
          )
        : [],
    };
  });

  return {
    overallVerdict: parsed.overallVerdict as 'Pass' | 'Partial' | 'Fail',
    confidence: Math.round(confidence),
    requirements,
    summary: String(parsed.summary || 'Evaluation complete.'),
    jiraTicketId,
    prUrl,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Main evaluation engine that uses Google Gemini to assess PR compliance.
 *
 * Multi-step process:
 *   Step 1: Parse and understand Jira requirements
 *   Step 2: Analyze GitHub PR diff and changes
 *   Step 3: Match each requirement to code changes
 *   Step 4: Generate verdict for each requirement
 *   Step 5: Calculate overall verdict
 *
 * @param jiraTicket - Structured Jira ticket data
 * @param pr - Structured GitHub PR data
 * @param jiraTicketId - Original ticket ID for result metadata
 * @param prUrl - Original PR URL for result metadata
 * @returns EvaluationResult with structured verdicts
 */
export async function evaluatePR(
  jiraTicket: JiraTicket,
  pr: GitHubPR,
  jiraTicketId: string,
  prUrl: string
): Promise<EvaluationResult> {
  const { GEMINI_API_KEY } = process.env;

  if (!GEMINI_API_KEY) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY in .env'
    );
  }

  console.log('[Evaluator] Initializing Gemini API (gemini-2.5-flash)...');
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Step 1 & 2: Build prompt combining Jira + GitHub data
  console.log('[Evaluator] Step 1/5: Parsing Jira requirements...');
  console.log(
    `  → Found ${jiraTicket.acceptanceCriteria.length} acceptance criteria`
  );

  console.log('[Evaluator] Step 2/5: Analyzing GitHub PR changes...');
  console.log(
    `  → ${pr.changedFiles} files changed, ${pr.commits.length} commits, diff length: ${pr.diff.length} chars`
  );

  const prompt = buildEvaluationPrompt(jiraTicket, pr);

  // Step 3: Send to Gemini for requirements matching
  console.log('[Evaluator] Step 3/5: Matching requirements to code changes...');
  console.log('[Evaluator] Step 4/5: Evaluating code changes with Gemini...');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${SYSTEM_PROMPT}\n\n${prompt}`,
  });
  const rawText = response.text || '';

  console.log(
    `[Evaluator] Gemini response received (${rawText.length} chars).`
  );

  // Step 5: Parse response and calculate overall verdict
  console.log('[Evaluator] Step 5/5: Generating structured verdict...');
  const evaluation = parseGeminiResponse(rawText, jiraTicketId, prUrl);

  console.log(
    `[Evaluator] Evaluation complete. Verdict: ${evaluation.overallVerdict} (${evaluation.confidence}% confidence)`
  );

  return evaluation;
}
