import { JiraTicket, GitHubPR } from '../types/index';

/**
 * System prompt that defines the AI persona and evaluation framework.
 * Instructs Gemini to act as an expert code reviewer.
 */
export const SYSTEM_PROMPT = `You are an expert senior software engineer and code reviewer with deep expertise in evaluating pull requests against product requirements.

Your role is to meticulously analyze:
1. Jira ticket requirements and acceptance criteria
2. GitHub pull request code changes (diffs, files, commits)
3. The alignment between what was required and what was implemented

You are precise, thorough, and evidence-based. You only mark a requirement as "Pass" when you can cite specific code evidence. You never assume implementation if you cannot see it in the diff.

Your evaluations are fair, detailed, and actionable. You provide file references and specific evidence for each verdict.

Always respond with valid JSON matching the exact schema requested.`;

/**
 * Builds the main evaluation prompt by injecting Jira and GitHub data.
 * The prompt instructs Gemini to evaluate each acceptance criterion
 * against the actual code changes in the PR.
 */
export function buildEvaluationPrompt(
  jiraTicket: JiraTicket,
  pr: GitHubPR
): string {
  const acceptanceCriteriaText =
    jiraTicket.acceptanceCriteria.length > 0
      ? jiraTicket.acceptanceCriteria
          .map((ac, i) => `${i + 1}. ${ac}`)
          .join('\n')
      : 'No explicit acceptance criteria found. Use the ticket description to infer requirements.';

  const filesChangedText = pr.filesChanged
    .map(
      (f) =>
        `- ${f.filename} (${f.status}: +${f.additions}/-${f.deletions} lines)`
    )
    .join('\n');

  const commitsText = pr.commits
    .map((c) => `- [${c.sha}] ${c.message} (by ${c.author})`)
    .join('\n');

  // Truncate diff to avoid exceeding token limits (keep ~50k chars)
  const diffText =
    pr.diff.length > 50000
      ? pr.diff.substring(0, 50000) +
        '\n... [diff truncated for token limits] ...'
      : pr.diff;

  return `
## JIRA TICKET DETAILS

**Ticket ID:** ${jiraTicket.key}
**Summary:** ${jiraTicket.summary}
**Priority:** ${jiraTicket.priority}
**Status:** ${jiraTicket.status}

**Description:**
${jiraTicket.description}

**Acceptance Criteria:**
${acceptanceCriteriaText}

---

## GITHUB PULL REQUEST DETAILS

**PR #${pr.number}:** ${pr.title}
**Author:** ${pr.author}
**Branch:** ${pr.headBranch} → ${pr.baseBranch}
**State:** ${pr.state}

**PR Description:**
${pr.description || 'No description provided.'}

**Commits (${pr.commits.length} total):**
${commitsText || 'No commits listed.'}

**Files Changed (${pr.changedFiles} files, +${pr.additions}/-${pr.deletions} lines):**
${filesChangedText || 'No files listed.'}

**Full Diff:**
\`\`\`diff
${diffText}
\`\`\`

---

## YOUR TASK

Evaluate whether this Pull Request satisfies the requirements from the Jira ticket.

Follow these steps:
1. Identify each distinct requirement from the Jira ticket (use acceptance criteria or infer from description)
2. For each requirement, search the diff and file changes for evidence of implementation
3. Assign a Pass or Fail verdict with specific evidence
4. Calculate an overall verdict:
   - **Pass**: All requirements are satisfied
   - **Partial**: Some requirements are satisfied but not all
   - **Fail**: No requirements or very few are satisfied
5. Calculate a confidence score (0-100) based on how clearly the code maps to the requirements

**IMPORTANT:** Respond ONLY with a valid JSON object matching this exact schema:

{
  "overallVerdict": "Pass" | "Partial" | "Fail",
  "confidence": <number 0-100>,
  "requirements": [
    {
      "id": <number>,
      "description": "<requirement description>",
      "verdict": "Pass" | "Fail",
      "evidence": "<specific evidence from the code changes>",
      "fileReferences": ["<filename1>", "<filename2>"]
    }
  ],
  "summary": "<2-3 sentence overall evaluation summary>"
}

Do not include any text outside the JSON object. Do not use markdown code blocks. Return raw JSON only.
`;
}
