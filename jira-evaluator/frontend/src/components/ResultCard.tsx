import React from 'react';
import { EvaluationResult, Requirement } from '../types/index';

interface ResultCardProps {
  result: EvaluationResult;
  onReset: () => void;
}

/**
 * Returns Tailwind color classes based on verdict value.
 */
function verdictColors(verdict: 'Pass' | 'Partial' | 'Fail') {
  switch (verdict) {
    case 'Pass':
      return {
        banner: 'bg-green-500/15 border-green-500/30',
        badge: 'bg-green-500/20 text-green-300 border border-green-500/30',
        text: 'text-green-400',
        icon: '✓',
      };
    case 'Partial':
      return {
        banner: 'bg-yellow-500/15 border-yellow-500/30',
        badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        text: 'text-yellow-400',
        icon: '⚡',
      };
    case 'Fail':
      return {
        banner: 'bg-red-500/15 border-red-500/30',
        badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
        text: 'text-red-400',
        icon: '✕',
      };
  }
}

/**
 * Badge component for Pass/Fail requirement verdicts.
 */
const VerdictBadge: React.FC<{ verdict: 'Pass' | 'Fail' }> = ({ verdict }) => {
  const isPass = verdict === 'Pass';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isPass
          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
      }`}
    >
      {isPass ? '✓ Pass' : '✕ Fail'}
    </span>
  );
};

/**
 * Individual requirement row in the evaluation table.
 */
const RequirementRow: React.FC<{ req: Requirement; index: number }> = ({
  req,
  index,
}) => {
  return (
    <div className="p-4 rounded-xl bg-dark-800 border border-dark-500 space-y-3 animate-slide-up">
      {/* Requirement header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
            {index + 1}
          </span>
          <p className="text-sm text-gray-200 leading-relaxed">
            {req.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <VerdictBadge verdict={req.verdict} />
        </div>
      </div>

      {/* Evidence */}
      <div className="ml-8 space-y-2">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          Evidence
        </div>
        <p className="text-sm text-gray-300 bg-dark-700 rounded-lg px-3 py-2 border border-dark-500">
          {req.evidence}
        </p>
      </div>

      {/* File references */}
      {req.fileReferences.length > 0 && (
        <div className="ml-8 space-y-1.5">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Files Referenced
          </div>
          <div className="flex flex-wrap gap-1.5">
            {req.fileReferences.map((file) => (
              <span
                key={file}
                className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md px-2 py-0.5 font-mono"
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Displays the full AI evaluation result including overall verdict,
 * confidence score, per-requirement breakdown, and summary.
 */
const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const colors = verdictColors(result.overallVerdict);
  const passCount = result.requirements.filter((r) => r.verdict === 'Pass').length;
  const totalCount = result.requirements.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Verdict Banner */}
      <div
        className={`rounded-2xl border p-6 ${colors.banner} flex flex-col sm:flex-row items-center gap-4`}
      >
        <div className="text-4xl font-black">{colors.icon}</div>
        <div className="text-center sm:text-left flex-1">
          <div className="text-sm text-gray-400 font-medium mb-1">
            Overall Verdict
          </div>
          <div className={`text-3xl font-black ${colors.text}`}>
            {result.overallVerdict}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {passCount} of {totalCount} requirements satisfied
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex flex-col items-center bg-dark-800/60 rounded-xl px-5 py-3 border border-dark-500/50">
          <span className="text-xs text-gray-500 font-medium mb-1">
            Confidence
          </span>
          <span className={`text-2xl font-black ${colors.text}`}>
            {result.confidence}%
          </span>
          {/* Confidence bar */}
          <div className="w-20 h-1.5 bg-dark-600 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                result.overallVerdict === 'Pass'
                  ? 'bg-green-500'
                  : result.overallVerdict === 'Partial'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ticket & PR meta */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-gray-300">
          🎫 {result.jiraTicketId}
        </span>
        <a
          href={result.prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-indigo-400 hover:text-indigo-300 transition-colors truncate max-w-xs"
        >
          🔗 View PR ↗
        </a>
        <span className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-gray-500">
          🕐 {new Date(result.evaluatedAt).toLocaleString()}
        </span>
      </div>

      {/* Per-Requirement Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Requirements Breakdown
        </h3>
        <div className="space-y-3">
          {result.requirements.map((req, index) => (
            <RequirementRow key={req.id} req={req} index={index} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          AI Summary
        </h3>
        <p className="text-gray-200 text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-3 px-6 border border-dark-500 bg-dark-700 hover:bg-dark-600
                   text-gray-300 font-semibold rounded-xl transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Evaluate Another PR
      </button>
    </div>
  );
};

export default ResultCard;
