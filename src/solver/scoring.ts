import type { Fold, Solution } from './types';

const SIMPLICITY_WEIGHTS: Record<string, number> = {
  'edge-to-edge': 10,
  'corner-to-corner': 8,
  'line-to-line': 6,
  'point-to-point': 5,
  'point-to-line': 3,
};

export function simplicityScore(folds: Fold[]): number {
  if (folds.length === 0) return 10;
  let total = 0;
  for (const f of folds) {
    total += SIMPLICITY_WEIGHTS[f.type] ?? 1;
  }
  return total / folds.length;
}

export function robustnessScore(folds: Fold[]): number {
  if (folds.length === 0) return 10;
  let penalty = 0;
  for (const f of folds) {
    penalty += f.ref1.index * 0.1 + f.ref2.index * 0.1;
  }
  return Math.max(0, 10 - penalty / folds.length);
}

export function rankSolutions(solutions: Solution[]): void {
  solutions.sort((a, b) => {
    if (a.foldCount !== b.foldCount) return a.foldCount - b.foldCount;
    if (Math.abs(a.error - b.error) > 1e-10) return a.error - b.error;
    if (Math.abs(a.robustnessScore - b.robustnessScore) > 0.01)
      return b.robustnessScore - a.robustnessScore;
    return b.simplicityScore - a.simplicityScore;
  });

  for (let i = 0; i < solutions.length; i++) {
    solutions[i]!.rank = i + 1;
  }
}
