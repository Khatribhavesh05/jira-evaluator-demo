import React, { useState, useCallback } from 'react';
import InputForm from '../components/InputForm';
import ProgressTracker from '../components/ProgressTracker';
import { evaluatePR } from '../api/evaluator';
import { EvaluationResult, ProgressStep } from '../types/index';

interface HomeProps {
  onResult: (result: EvaluationResult) => void;
}

const INITIAL_STEPS: ProgressStep[] = [
  { id: 1, label: 'Fetching Jira ticket details...', status: 'pending' },
  { id: 2, label: 'Fetching GitHub PR changes...', status: 'pending' },
  { id: 3, label: 'Analyzing requirements...', status: 'pending' },
  { id: 4, label: 'Evaluating code changes...', status: 'pending' },
  { id: 5, label: 'Generating verdict...', status: 'pending' },
];

/**
 * Home page: houses the input form and shows live progress during evaluation.
 * Calls the backend API and passes the result up to App on completion.
 */
const Home: React.FC<HomeProps> = ({ onResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);

  /** Updates a single step's status */
  const updateStep = useCallback(
    (id: number, status: ProgressStep['status']) => {
      setSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    },
    []
  );

  const handleSubmit = async (jiraTicketId: string, prUrl: string) => {
    setIsLoading(true);
    setError(null);
    setSteps(INITIAL_STEPS);

    // Simulate step-by-step progress by advancing steps with delays.
    // The actual API call is single-shot; steps give UX feedback.
    try {
      updateStep(1, 'loading');

      // Start the real API call immediately
      const evalPromise = evaluatePR(jiraTicketId, prUrl);

      // Advance steps at timed intervals to reflect internal backend stages
      const stepTimings: [number, number, ProgressStep['status']][] = [
        [1, 3000, 'complete'], // Jira fetch ~3s
        [2, 6000, 'complete'], // GitHub fetch ~6s
        [3, 9000, 'complete'], // Analysis ~9s
        [4, 14000, 'complete'], // Evaluation ~14s
        [5, 17000, 'loading'], // Verdict assembly
      ];

      const timers: ReturnType<typeof setTimeout>[] = [];

      stepTimings.forEach(([id, delay, status]) => {
        timers.push(
          setTimeout(() => {
            // When a step completes, start the next one as loading
            updateStep(id, status);
            if (status === 'complete' && id < 5) {
              updateStep(id + 1, 'loading');
            }
          }, delay)
        );
      });

      const result = await evalPromise;

      // Clear pending timers and mark all steps complete
      timers.forEach(clearTimeout);
      setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'complete' })));

      onResult(result);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; hint?: string } }; message?: string };
      const msg =
        error.response?.data?.error ||
        error.response?.data?.hint ||
        error.message ||
        'Something went wrong. Please try again.';

      setError(msg);
      // Mark currently-loading step as error
      setSteps((prev) =>
        prev.map((s) =>
          s.status === 'loading' ? { ...s, status: 'error' } : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showProgress = isLoading || steps.some((s) => s.status !== 'pending');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-400 font-medium mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          Powered by Gemini 1.5 Pro
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Jira Ticket{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Evaluator
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          AI-powered PR compliance checker — instantly know if your PR satisfies
          the Jira requirements.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl glass-card p-6 sm:p-8 animate-slide-up">
        {!showProgress ? (
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            <div className="border-t border-dark-500 pt-6">
              <ProgressTracker steps={steps} />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            <p className="text-sm text-red-400 font-medium flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="mt-6 text-xs text-gray-600 text-center animate-fade-in">
        Evaluation typically takes 15–30 seconds depending on PR size.
      </p>
    </div>
  );
};

export default Home;
