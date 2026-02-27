import type { Solution, SearchProgress, SolveParams } from '../solver/types';
import { SolutionCard } from './SolutionCard';

interface ResultsPanelProps {
  solutions: Solution[];
  isSearching: boolean;
  progress: SearchProgress | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  solveParams: SolveParams | null;
}

export function ResultsPanel({
  solutions,
  isSearching,
  progress,
  selectedIndex,
  onSelect,
  solveParams,
}: ResultsPanelProps) {
  const pw = solveParams?.width ?? 1;
  const ph = solveParams?.height ?? 1;
  const target = solveParams?.target;

  const targetType = target?.type === 'lineX' ? 'lineX' : target?.type === 'lineY' ? 'lineY' : 'point';
  const targetX = target?.type === 'point' ? target.x : target?.type === 'lineX' ? target.x : undefined;
  const targetY = target?.type === 'point' ? target.y : target?.type === 'lineY' ? target.y : undefined;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Results</h2>
        {solutions.length > 0 && (
          <span className="text-sm text-gray-500">
            {solutions.length} solution{solutions.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isSearching && progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-blue-600 animate-spin"
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
            <span className="text-sm text-blue-700 font-medium">
              Searching depth {progress.depth}…
            </span>
          </div>
          <p className="text-xs text-blue-600">
            {progress.solutionsFound} solution
            {progress.solutionsFound !== 1 ? 's' : ''} found so far
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && solutions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            Enter your target reference and click{' '}
            <strong>Find References</strong> to search for fold sequences.
          </p>
        </div>
      )}

      {/* Solution cards */}
      {solutions.map((solution, i) => (
        <SolutionCard
          key={i}
          solution={solution}
          index={i}
          isExpanded={selectedIndex === i}
          onToggle={() => onSelect(i)}
          paperWidth={pw}
          paperHeight={ph}
          targetType={targetType}
          targetX={targetX}
          targetY={targetY}
        />
      ))}
    </section>
  );
}
