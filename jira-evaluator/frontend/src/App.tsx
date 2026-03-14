import { useState } from 'react';
import Home from './pages/Home';
import Results from './pages/Results';
import { EvaluationResult } from './types/index';

/**
 * Root application component.
 * Manages view state between Home (input + progress) and Results pages.
 * Uses simple state-based routing instead of react-router for simplicity.
 */
function App() {
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleResult = (evaluation: EvaluationResult) => {
    setResult(evaluation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (result) {
    return <Results result={result} onReset={handleReset} />;
  }

  return <Home onResult={handleResult} />;
}

export default App;
