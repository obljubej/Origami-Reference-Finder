import type { Fold, FoldState, FoldType, Line } from './types';
import {
  perpendicularBisector,
  angleBisectors,
  parallelBisector,
  linesParallel,
  lineIntersectsPaper,
  findDuplicateLine,
  pointsEqual,
  linesEqual,
  distancePP,
  absDistancePL,
} from './geometry';
import { EPSILON } from '../utils/math';
import { pointLabel, lineLabel } from './state';

export function generateMoves(state: FoldState): Fold[] {
  const folds: Fold[] = [];
  const seen: Line[] = [...state.lines];

  const tryAdd = (
    crease: Line,
    type: FoldType,
    ref1Kind: 'point' | 'line',
    ref1Idx: number,
    ref2Kind: 'point' | 'line',
    ref2Idx: number,
  ) => {
    if (findDuplicateLine(seen, crease) !== -1) return;
    if (!lineIntersectsPaper(crease, state.width, state.height)) return;

    seen.push(crease);
    folds.push({
      type,
      creaseLine: crease,
      description: '',
      ref1: {
        kind: ref1Kind,
        index: ref1Idx,
        label: ref1Kind === 'point'
          ? pointLabel(ref1Idx, state)
          : lineLabel(ref1Idx, state),
      },
      ref2: {
        kind: ref2Kind,
        index: ref2Idx,
        label: ref2Kind === 'point'
          ? pointLabel(ref2Idx, state)
          : lineLabel(ref2Idx, state),
      },
    });
  };

  const { points, lines } = state;

  // Point-to-Point folds
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const pi = points[i]!;
      const pj = points[j]!;
      if (pointsEqual(pi, pj)) continue;
      if (distancePP(pi, pj) < EPSILON) continue;

      const crease = perpendicularBisector(pi, pj);
      const type = classifyPointPoint(i, j);
      tryAdd(crease, type, 'point', i, 'point', j);
    }
  }

  // Line-to-Line folds
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const li = lines[i]!;
      const lj = lines[j]!;
      if (linesEqual(li, lj)) continue;

      if (linesParallel(li, lj)) {
        const mid = parallelBisector(li, lj);
        if (mid) {
          tryAdd(mid, 'line-to-line', 'line', i, 'line', j);
        }
      } else {
        const bisectors = angleBisectors(li, lj);
        for (const b of bisectors) {
          tryAdd(b, 'line-to-line', 'line', i, 'line', j);
        }
      }
    }
  }

  // Point-to-Line folds
  for (let pi = 0; pi < points.length; pi++) {
    const p = points[pi]!;
    for (let li = 0; li < lines.length; li++) {
      const l = lines[li]!;
      if (absDistancePL(p, l) < EPSILON) continue;

      for (let qi = 0; qi < points.length; qi++) {
        if (qi === pi) continue;
        const q = points[qi]!;
        if (absDistancePL(q, l) > EPSILON) continue;
        if (pointsEqual(p, q)) continue;

        const crease = perpendicularBisector(p, q);
        tryAdd(crease, 'point-to-line', 'point', pi, 'line', li);
      }
    }
  }

  return folds;
}

function classifyPointPoint(i: number, j: number): FoldType {
  const iIsCorner = i < 4;
  const jIsCorner = j < 4;
  if (iIsCorner && jIsCorner) return 'corner-to-corner';
  return 'point-to-point';
}
