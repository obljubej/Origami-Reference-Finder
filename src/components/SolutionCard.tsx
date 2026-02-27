import type { Solution } from '../solver/types';
import { StepList } from './StepList';
import { CreaseDiagram } from './CreaseDiagram';
import { ShareExport } from './ShareExport';
import { fmt, fmtPoint } from '../utils/format';

interface SolutionCardProps {
  solution: Solution;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  paperWidth: number;
  paperHeight: number;
  targetType: 'point' | 'lineX' | 'lineY';
  targetX?: number;
  targetY?: number;
}

export function SolutionCard({
  solution,
  index,
  isExpanded,
  onToggle,
  paperWidth,
  paperHeight,
  targetType,
  targetX,
  targetY,
}: SolutionCardProps) {
  const { foldCount, error, achievedPoint, achievedLine } = solution;

  // Build summary text
  let summary: string;
  if (achievedPoint) {
    summary = `Point ${fmtPoint(achievedPoint.x, achievedPoint.y)}`;
  } else if (achievedLine) {
    // Determine if it's x= or y= line
    if (Math.abs(achievedLine.b) < 0.001) {
      summary = `Line x = ${fmt(-achievedLine.c / achievedLine.a)}`;
    } else {
      summary = `Line y = ${fmt(-achievedLine.c / achievedLine.b)}`;
    }
  } else {
    summary = 'Unknown result';
  }

  // Build target info for diagram
  const targetPoint =
    targetType === 'point' && targetX !== undefined && targetY !== undefined
      ? { x: targetX, y: targetY }
      : undefined;

  const targetLine =
    targetType === 'lineX' && targetX !== undefined
      ? { type: 'lineX' as const, value: targetX }
      : targetType === 'lineY' && targetY !== undefined
        ? { type: 'lineY' as const, value: targetY }
        : undefined;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {foldCount} fold{foldCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500">
              error: {error < 1e-10 ? 'exact' : fmt(error)}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{summary}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Fold Instructions
              </h4>
              <StepList folds={solution.folds} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Crease Diagram
              </h4>
              <CreaseDiagram
                width={paperWidth}
                height={paperHeight}
                folds={solution.folds}
                targetPoint={targetPoint}
                targetLine={targetLine}
                achievedPoint={achievedPoint}
              />
            </div>
          </div>

          {/* Error details */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            {achievedPoint && (
              <span>
                Achieved: {fmtPoint(achievedPoint.x, achievedPoint.y)} | Error:{' '}
                {fmt(error)}
              </span>
            )}
            {achievedLine && !achievedPoint && (
              <span>
                Achieved line | Error: {fmt(error)}
              </span>
            )}
            {' | '}
            Robustness: {fmt(solution.robustnessScore)} | Simplicity:{' '}
            {fmt(solution.simplicityScore)}
          </div>

          <ShareExport
            solution={solution}
            paperWidth={paperWidth}
            paperHeight={paperHeight}
          />
        </div>
      )}
    </div>
  );
}
