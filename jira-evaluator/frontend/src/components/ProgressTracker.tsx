import React from 'react';
import { ProgressStep } from '../types/index';

interface ProgressTrackerProps {
  steps: ProgressStep[];
}

/**
 * Displays live progress steps during AI evaluation.
 * Shows pending / loading (animated spinner) / complete (checkmark) states.
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps }) => {
  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Evaluation Progress
      </h3>

      {steps.map((step) => (
        <div
          key={step.id}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            step.status === 'loading'
              ? 'bg-indigo-500/10 border border-indigo-500/20'
              : step.status === 'complete'
              ? 'bg-green-500/5 border border-green-500/10'
              : step.status === 'error'
              ? 'bg-red-500/10 border border-red-500/20'
              : 'bg-dark-600/50 border border-transparent'
          }`}
        >
          {/* Step Icon */}
          <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
            {step.status === 'loading' && (
              <svg
                className="animate-spin h-5 w-5 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}

            {step.status === 'complete' && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}

            {step.status === 'error' && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}

            {step.status === 'pending' && (
              <div className="w-5 h-5 border-2 border-dark-400 rounded-full" />
            )}
          </div>

          {/* Step Label */}
          <span
            className={`text-sm font-medium transition-colors duration-200 ${
              step.status === 'loading'
                ? 'text-indigo-300'
                : step.status === 'complete'
                ? 'text-green-400'
                : step.status === 'error'
                ? 'text-red-400'
                : 'text-gray-500'
            }`}
          >
            {step.label}
          </span>

          {/* Loading pulse dot */}
          {step.status === 'loading' && (
            <div className="ml-auto">
              <span className="inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;
