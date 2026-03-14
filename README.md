# 🤖 Jira Ticket Evaluator

> AI-powered Pull Request compliance checker — instantly know if your PR satisfies the Jira requirements.

## 🎯 What It Does

Takes a Jira ticket ID and a GitHub PR URL as inputs, then autonomously evaluates whether the code changes satisfy the stated requirements. Produces a structured verdict:

- ✅ **Pass** — all acceptance criteria met
- ⚠️ **Partial** — some criteria met, some missed
- ❌ **Fail** — requirements not addressed

## 🏗️ Architecture
```
User enters Jira ID + PR URL
        ↓
React Frontend (Vite + TypeScript)
        ↓
Express Backend (Node.js + TypeScript)
        ↓
AI Agent (Multi-step reasoning)
        ↓
┌──────────────────────────────────┐
│  Jira REST API  │  GitHub REST API │
└──────────────────────────────────┘
        ↓
Gemini 2.5 Flash (Evaluation Engine)
        ↓
Structured Verdict (Pass / Partial / Fail)
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI Model | Google Gemini 2.5 Flash |
| Ticket Source | Jira REST API v3 |
| PR Source | GitHub REST API |
| Styling | Tailwind CSS |

## 📋 Prerequisites

- Node.js v18 or higher
- A Jira account with API token
- A GitHub account with Personal Access Token
- Google Gemini API key

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Khatribhavesh05/jira-evaluator-demo.git
cd jira-evaluator-demo
```

### 2. Setup Backend
```bash
cd jira-evaluator/backend
npm install
```

### 3. Configure Environment Variables
```bash
cp ../env.example .env
```

Edit `.env` and fill in your credentials:
```
JIRA_EMAIL=your-email@gmail.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_DOMAIN=your-atlassian-domain
GITHUB_TOKEN=your-github-personal-access-token
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

### 5. Run the Application

**Terminal 1 — Start Backend:**
```bash
cd jira-evaluator/backend
npm run dev
```

**Terminal 2 — Start Frontend:**
```bash
cd jira-evaluator/frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🚀 How to Use

1. Enter a Jira Ticket ID (e.g. `KAN-1`)
2. Enter the GitHub PR URL
3. Click **"Evaluate PR"**
4. Watch the AI agent work through 5 steps
5. Get a detailed verdict with evidence per requirement

## 🧪 Sample Test Cases

| Jira Ticket | Type | PR | Expected Verdict |
|---|---|---|---|
| KAN-1 | Feature Request | /pull/1 | ⚠️ Partial |
| KAN-2 | Bug Fix | /pull/2 | ✅ Pass |
| KAN-4 | Refactor | /pull/3 | ⚠️ Partial |

## 📁 Project Structure
```
jira-evaluator-demo/
├── jira-evaluator/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts            ← Express server
│   │   │   ├── agent/
│   │   │   │   ├── evaluator.ts    ← AI evaluation engine
│   │   │   │   └── prompts.ts      ← Prompt templates
│   │   │   ├── tools/
│   │   │   │   ├── jiraTool.ts     ← Jira API integration
│   │   │   │   └── githubTool.ts   ← GitHub API integration
│   │   │   └── types/index.ts
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── InputForm.tsx
│       │   │   ├── ProgressTracker.tsx
│       │   │   └── ResultCard.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   └── Results.tsx
│       │   └── api/evaluator.ts
│       └── package.json
├── auth/                           ← Sample PR files
├── upload/                         ← Sample PR files
└── README.md
```

## 🔒 Security

- Never commit `.env` files
- API keys stored in environment variables only
- `.gitignore` excludes all sensitive files

## 🔮 Future Improvements

- Multi-agent architecture for parallel evaluation
- Custom test generation for each requirement
- Support for Linear, Shortcut, GitHub Issues
- Confidence scoring improvements
- Deployment on Railway + Vercel
- Report export as PDF
- Slack/Teams notification integration

## 👨‍💻 Built with ❤️ for Simplifai Hackathon
