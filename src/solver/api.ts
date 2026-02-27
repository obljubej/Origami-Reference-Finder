import type { Solution, SolveParams } from './types';
import { search } from './search';

export interface SolveOptions {
  maxDepth?: number;
  maxSolutions?: number;
  onSolution?: (solution: Solution) => void;
  onProgress?: (depth: number, solutionsFound: number) => void;
  shouldCancel?: () => boolean;
}

export function solvePoint(
  w: number, h: number, x: number, y: number, tol: number, options: SolveOptions = {},
): Solution[] {
  const params: SolveParams = {
    width: w, height: h,
    target: { type: 'point', x, y },
    tolerance: tol,
    maxDepth: options.maxDepth,
    maxSolutions: options.maxSolutions,
  };
  return search(params, {
    onSolution: options.onSolution,
    onProgress: options.onProgress,
    shouldCancel: options.shouldCancel,
  });
}

export function solveLineX(
  w: number, h: number, x: number, tol: number, options: SolveOptions = {},
): Solution[] {
  const params: SolveParams = {
    width: w, height: h,
    target: { type: 'lineX', x },
    tolerance: tol,
    maxDepth: options.maxDepth,
    maxSolutions: options.maxSolutions,
  };
  return search(params, {
    onSolution: options.onSolution,
    onProgress: options.onProgress,
    shouldCancel: options.shouldCancel,
  });
}

export function solveLineY(
  w: number, h: number, y: number, tol: number, options: SolveOptions = {},
): Solution[] {
  const params: SolveParams = {
    width: w, height: h,
    target: { type: 'lineY', y },
    tolerance: tol,
    maxDepth: options.maxDepth,
    maxSolutions: options.maxSolutions,
  };
  return search(params, {
    onSolution: options.onSolution,
    onProgress: options.onProgress,
    shouldCancel: options.shouldCancel,
  });
}
