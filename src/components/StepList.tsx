import type { Fold } from '../solver/types';

interface StepListProps {
  folds: Fold[];
}

export function StepList({ folds }: StepListProps) {
  if (folds.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Target is already constructible — no folds needed.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {folds.map((fold, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <span className="text-gray-700 pt-0.5">{fold.description}</span>
        </li>
      ))}
    </ol>
  );
}
