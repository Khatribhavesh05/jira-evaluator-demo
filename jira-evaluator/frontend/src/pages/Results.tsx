import React from 'react';
import ResultCard from '../components/ResultCard';
import { EvaluationResult } from '../types/index';

interface ResultsProps {
  result: EvaluationResult;
  onReset: () => void;
}

/**
 * Results page: displays the full AI evaluation result.
 * Shows the overall verdict, per-requirement breakdown, and summary.
 */
const Results: React.FC<ResultsProps> = ({ result, onReset }) => {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Evaluation{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Results
          </span>
        </h1>
        <p className="text-gray-500 text-sm">
          {result.jiraTicketId} &nbsp;·&nbsp;{' '}
          {result.requirements.length} requirement
          {result.requirements.length !== 1 ? 's' : ''} evaluated
        </p>
      </div>

      {/* Result card */}
      <div className="w-full max-w-2xl">
        <ResultCard result={result} onReset={onReset} />
      </div>
    </div>
  );
};

export default Results;
