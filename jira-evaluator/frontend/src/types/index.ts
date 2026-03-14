// Shared type definitions for the Jira Ticket Evaluator frontend

export interface Requirement {
  id: number;
  description: string;
  verdict: 'Pass' | 'Fail';
  evidence: string;
  fileReferences: string[];
}

export interface EvaluationResult {
  overallVerdict: 'Pass' | 'Partial' | 'Fail';
  confidence: number; // 0-100
  requirements: Requirement[];
  summary: string;
  jiraTicketId: string;
  prUrl: string;
  evaluatedAt: string;
}

export interface EvaluateRequest {
  jiraTicketId: string;
  prUrl: string;
}

export type ProgressStep = {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
};
