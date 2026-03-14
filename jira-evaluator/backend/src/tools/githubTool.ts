import axios from 'axios';
import { GitHubPR, GitHubFile, GitHubCommit, GitHubComment, ParsedPRUrl } from '../types/index';

/**
 * Parses a GitHub PR URL into its components (owner, repo, PR number).
 * Supports formats:
 *   https://github.com/owner/repo/pull/123
 *   https://github.com/owner/repo/pull/123/files
 */
export function parsePRUrl(prUrl: string): ParsedPRUrl {
  const match = prUrl.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );

  if (!match) {
    throw new Error(
      `Invalid GitHub PR URL: "${prUrl}". Expected format: https://github.com/owner/repo/pull/123`
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    prNumber: parseInt(match[3], 10),
  };
}

/**
 * Fetches comprehensive details about a GitHub Pull Request.
 * Includes: PR metadata, file diffs, commits, and review comments.
 * Requires GITHUB_TOKEN environment variable.
 */
export async function fetchPRDetails(prUrl: string): Promise<GitHubPR> {
  const { GITHUB_TOKEN } = process.env;

  if (!GITHUB_TOKEN) {
    throw new Error(
      'Missing GitHub token. Set GITHUB_TOKEN in .env'
    );
  }

  const { owner, repo, prNumber } = parsePRUrl(prUrl);

  console.log(
    `[GitHubTool] Fetching PR #${prNumber} from ${owner}/${repo}`
  );

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

  // Fetch PR details, files, commits, and comments in parallel
  const [prResponse, filesResponse, commitsResponse, commentsResponse] =
    await Promise.all([
      axios.get(apiBase, { headers }),
      axios.get(`${apiBase}/files`, {
        headers,
        params: { per_page: 100 },
      }),
      axios.get(`${apiBase}/commits`, {
        headers,
        params: { per_page: 100 },
      }),
      axios.get(`${apiBase}/comments`, {
        headers,
        params: { per_page: 100 },
      }),
    ]);

  const pr = prResponse.data;

  // Map files to structured format
  const filesChanged: GitHubFile[] = filesResponse.data.map(
    (f: Record<string, unknown>) => ({
      filename: f.filename as string,
      status: f.status as string,
      additions: f.additions as number,
      deletions: f.deletions as number,
      changes: f.changes as number,
      patch: f.patch as string | undefined,
    })
  );

  // Map commits to structured format
  const commits: GitHubCommit[] = commitsResponse.data.map(
    (c: Record<string, unknown>) => {
      const commitData = c.commit as Record<string, unknown>;
      const authorData = commitData.author as Record<string, unknown>;
      const commitAuthor = c.author as Record<string, unknown> | null;
      return {
        sha: (c.sha as string).substring(0, 8),
        message: commitData.message as string,
        author: commitAuthor?.login as string || authorData?.name as string || 'unknown',
        date: authorData?.date as string || '',
      };
    }
  );

  // Map review comments to structured format
  const comments: GitHubComment[] = commentsResponse.data.map(
    (c: Record<string, unknown>) => {
      const commentAuthor = c.user as Record<string, unknown>;
      return {
        id: c.id as number,
        body: c.body as string,
        author: commentAuthor?.login as string || 'unknown',
        createdAt: c.created_at as string,
      };
    }
  );

  // Build a single unified diff string from all file patches
  const diff = filesChanged
    .filter((f) => f.patch)
    .map((f) => `--- ${f.filename}\n+++ ${f.filename}\n${f.patch}`)
    .join('\n\n');

  console.log(
    `[GitHubTool] PR fetched. Files: ${filesChanged.length}, Commits: ${commits.length}, Diff lines: ${diff.split('\n').length}`
  );

  return {
    number: pr.number,
    title: pr.title,
    description: pr.body || '',
    state: pr.state,
    author: pr.user?.login || 'unknown',
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    headBranch: pr.head?.ref || '',
    baseBranch: pr.base?.ref || '',
    filesChanged,
    commits,
    comments,
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    changedFiles: pr.changed_files || 0,
    diff,
  };
}
