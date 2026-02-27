import { useState } from 'react';
import type { Solution } from '../solver/types';
import { solutionToText } from '../solver/descriptions';
import { initialState } from '../solver/state';

interface ShareExportProps {
  solution: Solution;
  paperWidth: number;
  paperHeight: number;
}

export function ShareExport({ solution, paperWidth, paperHeight }: ShareExportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    const state = initialState(paperWidth, paperHeight);
    const text = solutionToText(solution.folds, state, solution.error);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Clipboard API not available');
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(solution, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `origami-solution-${solution.foldCount}folds.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2 mt-3">
      <button onClick={handleCopyText}
        className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
        {copied ? '✓ Copied!' : 'Copy Steps'}
      </button>
      <button onClick={handleExportJSON}
        className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
        Export JSON
      </button>
    </div>
  );
}
