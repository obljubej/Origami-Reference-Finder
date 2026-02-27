import type { FoldState, Target, Solution, Fold, Point, Line, SolveParams } from './types';
import { initialState, applyFold, stateHash } from './state';
import { generateMoves } from './moves';
import { describeFold } from './descriptions';
import { simplicityScore, robustnessScore, rankSolutions } from './scoring';
import { distancePP, normaliseLine } from './geometry';
import { approxEqual } from '../utils/math';

interface Match {
  point?: Point;
  line?: Line;
  error: number;
}

function evaluateTarget(state: FoldState, target: Target, tolerance: number): Match | null {
  let bestMatch: Match | null = null;

  if (target.type === 'point') {
    for (const p of state.points) {
      const err = distancePP(p, { x: target.x, y: target.y });
      if (err <= tolerance) {
        if (!bestMatch || err < bestMatch.error) {
          bestMatch = { point: p, error: err };
        }
      }
    }
  } else if (target.type === 'lineX') {
    for (const p of state.points) {
      const err = Math.abs(p.x - target.x);
      if (err <= tolerance) {
        if (!bestMatch || err < bestMatch.error) {
          bestMatch = { point: p, line: normaliseLine(1, 0, -p.x), error: err };
        }
      }
    }
    for (const l of state.lines) {
      if (approxEqual(Math.abs(l.a), 1, 0.001) && approxEqual(l.b, 0, 0.001)) {
        const c = -l.c / l.a;
        const err = Math.abs(c - target.x);
        if (err <= tolerance) {
          if (!bestMatch || err < bestMatch.error) {
            bestMatch = { line: l, error: err };
          }
        }
      }
    }
  } else if (target.type === 'lineY') {
    for (const p of state.points) {
      const err = Math.abs(p.y - target.y);
      if (err <= tolerance) {
        if (!bestMatch || err < bestMatch.error) {
          bestMatch = { point: p, line: normaliseLine(0, 1, -p.y), error: err };
        }
      }
    }
    for (const l of state.lines) {
      if (approxEqual(l.a, 0, 0.001) && approxEqual(Math.abs(l.b), 1, 0.001)) {
        const c = -l.c / l.b;
        const err = Math.abs(c - target.y);
        if (err <= tolerance) {
          if (!bestMatch || err < bestMatch.error) {
            bestMatch = { line: l, error: err };
          }
        }
      }
    }
  }

  return bestMatch;
}

export interface SearchCallbacks {
  onSolution?: (solution: Solution) => void;
  onProgress?: (depth: number, solutionsFound: number) => void;
  shouldCancel?: () => boolean;
}

export function search(params: SolveParams, callbacks: SearchCallbacks = {}): Solution[] {
  const { width, height, target, tolerance } = params;
  const maxDepth = params.maxDepth ?? 6;
  const maxSolutions = params.maxSolutions ?? 10;

  const solutions: Solution[] = [];
  const visited = new Map<string, number>();

  const state0 = initialState(width, height);

  const match0 = evaluateTarget(state0, target, tolerance);
  if (match0) {
    solutions.push(buildSolution([], match0));
    if (solutions.length >= maxSolutions) {
      rankSolutions(solutions);
      return solutions;
    }
  }

  for (let depthLimit = 1; depthLimit <= maxDepth; depthLimit++) {
    if (callbacks.shouldCancel?.()) break;
    callbacks.onProgress?.(depthLimit, solutions.length);

    visited.clear();
    dfs(state0, 0, depthLimit, target, tolerance, solutions, visited, maxSolutions, callbacks);

    if (solutions.length >= maxSolutions) break;
  }

  rankSolutions(solutions);
  return solutions;
}

function dfs(
  state: FoldState,
  depth: number,
  depthLimit: number,
  target: Target,
  tolerance: number,
  solutions: Solution[],
  visited: Map<string, number>,
  maxSolutions: number,
  callbacks: SearchCallbacks,
): void {
  if (solutions.length >= maxSolutions) return;
  if (callbacks.shouldCancel?.()) return;
  if (depth >= depthLimit) return;

  const moves = generateMoves(state);

  for (const move of moves) {
    if (solutions.length >= maxSolutions) return;
    if (callbacks.shouldCancel?.()) return;

    move.description = describeFold(move, state);

    const newState = applyFold(state, move);

    const hash = stateHash(newState);
    const prevDepth = visited.get(hash);
    if (prevDepth !== undefined && prevDepth <= depth + 1) continue;
    visited.set(hash, depth + 1);

    const match = evaluateTarget(newState, target, tolerance);
    if (match) {
      const folds = [...newState.foldHistory];
      const solution = buildSolution(folds, match);

      if (!isDuplicateSolution(solution, solutions)) {
        solutions.push(solution);
        callbacks.onSolution?.(solution);
      }
      continue;
    }

    if (depth + 1 < depthLimit) {
      dfs(newState, depth + 1, depthLimit, target, tolerance, solutions, visited, maxSolutions, callbacks);
    }
  }
}

function buildSolution(folds: Fold[], match: Match): Solution {
  return {
    folds,
    foldCount: folds.length,
    achievedPoint: match.point,
    achievedLine: match.line,
    error: match.error,
    robustnessScore: robustnessScore(folds),
    simplicityScore: simplicityScore(folds),
    rank: 0,
  };
}

function isDuplicateSolution(candidate: Solution, existing: Solution[]): boolean {
  for (const s of existing) {
    if (s.foldCount !== candidate.foldCount) continue;
    if (Math.abs(s.error - candidate.error) > 1e-8) continue;
    if (s.folds.length !== candidate.folds.length) continue;

    let same = true;
    for (let i = 0; i < s.folds.length; i++) {
      const sf = s.folds[i]!;
      const cf = candidate.folds[i]!;
      if (
        !approxEqual(sf.creaseLine.a, cf.creaseLine.a, 1e-6) ||
        !approxEqual(sf.creaseLine.b, cf.creaseLine.b, 1e-6) ||
        !approxEqual(sf.creaseLine.c, cf.creaseLine.c, 1e-6)
      ) {
        same = false;
        break;
      }
    }
    if (same) return true;
  }
  return false;
}
