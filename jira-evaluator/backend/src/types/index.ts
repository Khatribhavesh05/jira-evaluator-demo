// Shared type definitions for the Jira Ticket Evaluator backend

export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  priority: string;
  status: string;
  acceptanceCriteria: string[];
  rawDescription: string;
}

export interface GitHubFile {
  filename: string;
  status: string; // added | removed | modified | renamed
  additions: number;
  deletions: number;
  changes: number;
  patch?: string; // unified diff patch
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  author: string;
  createdAt: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  description: string;
  state: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  headBranch: string;
  baseBranch: string;
  filesChanged: GitHubFile[];
  commits: GitHubCommit[];
  comments: GitHubComment[];
  additions: number;
  deletions: number;
  changedFiles: number;
  diff: string; // Full concatenated diff
}

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

export interface ParsedPRUrl {
  owner: string;
  repo: string;
  prNumber: number;
}
