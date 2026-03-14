import axios from 'axios';
import { JiraTicket } from '../types/index';

/**
 * Extracts acceptance criteria from a Jira ticket description.
 * Looks for common patterns like "Acceptance Criteria", "AC:", bullet points, etc.
 */
function extractAcceptanceCriteria(description: string): string[] {
  if (!description) return [];

  const criteria: string[] = [];

  // Attempt to find an "Acceptance Criteria" section
  const acSectionRegex =
    /acceptance\s+criteria[:\s]*([\s\S]*?)(?=\n#{1,3}\s|\n\*\*[A-Z]|\z)/gi;
  const acMatch = acSectionRegex.exec(description);

  if (acMatch && acMatch[1]) {
    const section = acMatch[1].trim();
    // Split on bullet points, numbered lists, or newlines
    const lines = section
      .split(/\n/)
      .map((l) => l.replace(/^[\s\-\*\d\.]+/, '').trim())
      .filter((l) => l.length > 10);
    criteria.push(...lines);
  }

  // If no AC section found, extract bullet points from entire description
  if (criteria.length === 0) {
    const bulletLines = description
      .split(/\n/)
      .map((l) => l.replace(/^[\s\-\*\d\.]+/, '').trim())
      .filter((l) => l.length > 15 && !l.startsWith('#'));
    criteria.push(...bulletLines.slice(0, 10)); // cap at 10 items
  }

  return [...new Set(criteria)]; // deduplicate
}

/**
 * Converts Atlassian Document Format (ADF) JSON to plain text.
 * Jira REST API v3 returns descriptions in ADF format.
 */
function adfToText(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return '';

  const node = adf as Record<string, unknown>;

  if (node.type === 'text') {
    return (node.text as string) || '';
  }

  if (node.content && Array.isArray(node.content)) {
    const childTexts = (node.content as unknown[]).map(adfToText);
    const joined = childTexts.join('');

    // Add newlines after block-level nodes
    const blockNodes = [
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'listItem',
      'blockquote',
      'codeBlock',
      'rule',
    ];
    if (blockNodes.includes(node.type as string)) {
      return joined + '\n';
    }

    return joined;
  }

  return '';
}

/**
 * Fetches a Jira ticket by its key (e.g. "KAN-1") using Jira REST API v3.
 * Requires JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_DOMAIN environment variables.
 */
export async function fetchJiraTicket(ticketId: string): Promise<JiraTicket> {
  const { JIRA_EMAIL, JIRA_API_TOKEN, JIRA_DOMAIN } = process.env;

  if (!JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_DOMAIN) {
    throw new Error(
      'Missing Jira credentials. Set JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_DOMAIN in .env'
    );
  }

  const credentials = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString(
    'base64'
  );
  const baseUrl = `https://${JIRA_DOMAIN}.atlassian.net`;
  const url = `${baseUrl}/rest/api/3/issue/${ticketId}`;

  console.log(`[JiraTool] Fetching ticket: ${ticketId} from ${baseUrl}`);

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const issue = response.data;
  const fields = issue.fields;

  // Convert ADF description to plain text
  const rawDescription =
    fields.description ? adfToText(fields.description) : '';

  // Extract description text for display
  const description =
    rawDescription ||
    fields.description?.text ||
    'No description provided.';

  const acceptanceCriteria = extractAcceptanceCriteria(description);

  console.log(
    `[JiraTool] Ticket fetched. Summary: "${fields.summary}". AC items: ${acceptanceCriteria.length}`
  );

  return {
    id: issue.id,
    key: issue.key,
    summary: fields.summary || '',
    description,
    priority: fields.priority?.name || 'Medium',
    status: fields.status?.name || 'Unknown',
    acceptanceCriteria,
    rawDescription,
  };
}
