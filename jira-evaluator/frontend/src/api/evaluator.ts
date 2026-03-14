import axios from 'axios';
import { EvaluationResult, EvaluateRequest } from '../types/index';

const API_BASE = '/api';

/**
 * Sends a Jira ticket ID and GitHub PR URL to the backend for AI evaluation.
 * Returns a structured EvaluationResult with Pass/Partial/Fail verdict.
 */
export async function evaluatePR(
  jiraTicketId: string,
  prUrl: string
): Promise<EvaluationResult> {
  const payload: EvaluateRequest = { jiraTicketId, prUrl };

  const response = await axios.post<EvaluationResult>(
    `${API_BASE}/evaluate`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000, // 2 minute timeout for AI evaluation
    }
  );

  return response.data;
}
