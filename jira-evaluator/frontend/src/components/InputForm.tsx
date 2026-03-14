import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (jiraTicketId: string, prUrl: string) => void;
  isLoading: boolean;
}

/**
 * Form component for entering a Jira ticket ID and GitHub PR URL.
 * Validates both fields before allowing submission.
 */
const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [errors, setErrors] = useState<{ jira?: string; pr?: string }>({});

  const validate = (): boolean => {
    const newErrors: { jira?: string; pr?: string } = {};

    if (!jiraTicketId.trim()) {
      newErrors.jira = 'Jira Ticket ID is required.';
    } else if (!/^[A-Z][A-Z0-9]+-\d+$/i.test(jiraTicketId.trim())) {
      newErrors.jira = 'Invalid format. Expected something like "KAN-1" or "PROJ-42".';
    }

    if (!prUrl.trim()) {
      newErrors.pr = 'GitHub PR URL is required.';
    } else if (
      !/^https?:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(prUrl.trim())
    ) {
      newErrors.pr =
        'Invalid URL. Expected: https://github.com/owner/repo/pull/123';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(jiraTicketId.trim().toUpperCase(), prUrl.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Jira Ticket ID */}
      <div>
        <label
          htmlFor="jiraTicketId"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Jira Ticket ID
        </label>
        <input
          id="jiraTicketId"
          type="text"
          value={jiraTicketId}
          onChange={(e) => {
            setJiraTicketId(e.target.value);
            if (errors.jira) setErrors({ ...errors, jira: undefined });
          }}
          placeholder="e.g. KAN-1"
          className={`input-field ${
            errors.jira ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          disabled={isLoading}
          autoComplete="off"
          spellCheck={false}
        />
        {errors.jira && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <span>⚠</span> {errors.jira}
          </p>
        )}
      </div>

      {/* GitHub PR URL */}
      <div>
        <label
          htmlFor="prUrl"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          GitHub PR URL
        </label>
        <input
          id="prUrl"
          type="url"
          value={prUrl}
          onChange={(e) => {
            setPrUrl(e.target.value);
            if (errors.pr) setErrors({ ...errors, pr: undefined });
          }}
          placeholder="https://github.com/owner/repo/pull/123"
          className={`input-field ${
            errors.pr ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          disabled={isLoading}
          autoComplete="off"
          spellCheck={false}
        />
        {errors.pr && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <span>⚠</span> {errors.pr}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
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
            Evaluating...
          </>
        ) : (
          <>
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Evaluate PR
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
