import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJiraTicket } from './tools/jiraTool';
import { fetchPRDetails } from './tools/githubTool';
import { evaluatePR } from './agent/evaluator';
import { EvaluateRequest } from './types/index';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

// Enable CORS for the Vite frontend
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/evaluate
 * Main evaluation endpoint.
 * Accepts a Jira ticket ID and GitHub PR URL, runs AI evaluation,
 * and returns a structured verdict.
 */
app.post(
  '/api/evaluate',
  async (req: Request, res: Response): Promise<void> => {
    const { jiraTicketId, prUrl } = req.body as EvaluateRequest;

    // Input validation
    if (!jiraTicketId || typeof jiraTicketId !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "jiraTicketId". Expected a string like "KAN-1".',
      });
      return;
    }

    if (!prUrl || typeof prUrl !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "prUrl". Expected a GitHub PR URL.',
      });
      return;
    }

    if (!prUrl.match(/github\.com\/[^/]+\/[^/]+\/pull\/\d+/)) {
      res.status(400).json({
        error:
          'Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123',
      });
      return;
    }

    console.log(
      `\n${'='.repeat(60)}\n[Server] Starting evaluation\n  Jira: ${jiraTicketId}\n  PR:   ${prUrl}\n${'='.repeat(60)}`
    );

    try {
      // Step 1: Fetch Jira ticket data
      console.log('\n[Server] Fetching Jira ticket...');
      const jiraTicket = await fetchJiraTicket(jiraTicketId.trim());

      // Step 2: Fetch GitHub PR data
      console.log('\n[Server] Fetching GitHub PR...');
      const prDetails = await fetchPRDetails(prUrl.trim());

      // Step 3-5: Run AI evaluation
      console.log('\n[Server] Running AI evaluation...');
      const result = await evaluatePR(
        jiraTicket,
        prDetails,
        jiraTicketId.trim(),
        prUrl.trim()
      );

      console.log(`\n[Server] Evaluation complete. Sending response.`);
      res.json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`\n[Server] Evaluation failed:`, error.message);

      // Provide informative error responses
      if (error.message.includes('Jira')) {
        res.status(502).json({
          error: `Jira API error: ${error.message}`,
          hint: 'Check your JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_DOMAIN in .env',
        });
      } else if (error.message.includes('GitHub') || error.message.includes('github')) {
        res.status(502).json({
          error: `GitHub API error: ${error.message}`,
          hint: 'Check your GITHUB_TOKEN in .env and verify the PR URL is correct.',
        });
      } else if (error.message.includes('Gemini') || error.message.includes('GEMINI')) {
        res.status(502).json({
          error: `Gemini API error: ${error.message}`,
          hint: 'Check your GEMINI_API_KEY in .env',
        });
      } else {
        res.status(500).json({
          error: error.message || 'Internal server error',
        });
      }
    }
  }
);

// 404 handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Jira Ticket Evaluator - Backend Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

export default app;
