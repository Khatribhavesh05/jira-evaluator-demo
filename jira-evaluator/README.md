# Jira Ticket Evaluator

An AI-powered system that evaluates GitHub Pull Requests against Jira ticket requirements. Enter a Jira ticket ID and a GitHub PR URL, and the system returns a **Pass / Partial / Fail** verdict for each acceptance criterion.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind |
| Backend   | Node.js + TypeScript + Express          |
| AI        | Google Gemini 1.5 Pro                   |
| APIs      | Jira REST API v3, GitHub REST API       |

---

## Project Structure

```
jira-evaluator/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Root component, view state management
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # Tailwind base styles
│   │   ├── components/
│   │   │   ├── InputForm.tsx        # Jira ID + PR URL form with validation
│   │   │   ├── ProgressTracker.tsx  # Live 5-step progress display
│   │   │   └── ResultCard.tsx       # Verdict display with breakdown table
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with form + progress
│   │   │   └── Results.tsx          # Results display page
│   │   ├── types/index.ts           # Shared TypeScript interfaces
│   │   └── api/evaluator.ts         # Backend API client
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Express server, /api/evaluate endpoint
│   │   ├── agent/
│   │   │   ├── evaluator.ts         # Gemini evaluation engine (5-step)
│   │   │   └── prompts.ts           # System + evaluation prompts
│   │   ├── tools/
│   │   │   ├── jiraTool.ts          # Jira REST API v3 integration
│   │   │   └── githubTool.ts        # GitHub REST API integration
│   │   └── types/index.ts           # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example                     # Environment variable template
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- A Jira Cloud account with API access
- A GitHub account with a Personal Access Token
- A Google AI Studio account with a Gemini API key

---

## Setup

### 1. Clone and navigate to the project

```bash
cd jira-evaluator
```

### 2. Create your environment file

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in all values:

```env
JIRA_EMAIL=your-email@gmail.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_DOMAIN=your-domain          # e.g. bhaveshkhatri1357 (no .atlassian.net)
GITHUB_TOKEN=your-github-token
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
```

### 3. Get your API credentials

**Jira API Token:**
1. Go to https://id.atlassian.net/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token into `JIRA_API_TOKEN`

**GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Generate a classic token with `repo` (read) scope
3. Copy into `GITHUB_TOKEN`

**Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Copy into `GEMINI_API_KEY`

### 4. Install dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

The server starts at http://localhost:3001. Verify with:
```bash
curl http://localhost:3001/health
```

### 6. Start the frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Usage

1. Open http://localhost:5173
2. Enter a **Jira Ticket ID** (e.g. `KAN-1`)
3. Enter the **GitHub PR URL** (e.g. `https://github.com/owner/repo/pull/42`)
4. Click **Evaluate PR**
5. Watch the 5-step progress tracker as the AI works
6. View the **Pass / Partial / Fail** verdict with per-requirement evidence

---

## API Reference

### `POST /api/evaluate`

**Request body:**
```json
{
  "jiraTicketId": "KAN-1",
  "prUrl": "https://github.com/owner/repo/pull/42"
}
```

**Response:**
```json
{
  "overallVerdict": "Pass",
  "confidence": 87,
  "requirements": [
    {
      "id": 1,
      "description": "User can log in with email and password",
      "verdict": "Pass",
      "evidence": "LoginForm.tsx implements email/password fields with validation",
      "fileReferences": ["src/components/LoginForm.tsx", "src/api/auth.ts"]
    }
  ],
  "summary": "The PR satisfies all acceptance criteria...",
  "jiraTicketId": "KAN-1",
  "prUrl": "https://github.com/owner/repo/pull/42",
  "evaluatedAt": "2026-03-15T10:00:00.000Z"
}
```

---

## How It Works

1. **Jira Fetch** — Calls Jira REST API v3, converts ADF description to plain text, extracts acceptance criteria
2. **GitHub Fetch** — Fetches PR metadata, file diffs (patches), commits, and review comments in parallel
3. **Prompt Construction** — Builds a detailed prompt injecting all Jira + GitHub data
4. **Gemini Evaluation** — Sends to `gemini-1.5-pro` with low temperature (0.2) for analytical output
5. **Result Parsing** — Validates and structures the JSON response into the verdict schema

---

## Build for Production

```bash
# Backend
cd backend && npm run build
node dist/index.js

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with any static file server
```
