import type { Fold, FoldState } from './types';
import { approxEqual } from '../utils/math';

function creaseKind(fold: Fold): string {
  const { a, b } = fold.creaseLine;
  if (approxEqual(Math.abs(a), 1, 0.01) && approxEqual(b, 0, 0.01)) return 'vertical';
  if (approxEqual(a, 0, 0.01) && approxEqual(Math.abs(b), 1, 0.01)) return 'horizontal';
  return 'diagonal';
}

export function describeFold(fold: Fold, _state: FoldState): string {
  const r1 = fold.ref1.label;
  const r2 = fold.ref2.label;
  const kind = creaseKind(fold);

  switch (fold.type) {
    case 'edge-to-edge':
      return `Fold ${r1} to ${r2} to create a ${kind} midline crease.`;
    case 'corner-to-corner':
      return `Fold ${r1} to ${r2} to create a ${kind} crease.`;
    case 'point-to-point':
      return `Fold ${r1} to ${r2} to create a ${kind} crease.`;
    case 'point-to-line':
      return `Fold ${r1} onto ${r2} to create a ${kind} crease.`;
    case 'line-to-line':
      return `Fold ${r1} onto ${r2} to create a ${kind} crease.`;
    default:
      return `Fold ${r1} to ${r2}.`;
  }
}

export function describeSteps(folds: Fold[], state: FoldState): string[] {
  return folds.map((fold, i) => {
    const desc = describeFold(fold, state);
    return `Step ${i + 1}: ${desc}`;
  });
}

export function solutionToText(folds: Fold[], state: FoldState, error: number): string {
  const steps = describeSteps(folds, state);
  const header = `Origami Reference Finder — ${folds.length} fold${folds.length !== 1 ? 's' : ''} (error: ${error.toFixed(6)})`;
  return [header, '', ...steps].join('\n');
}
