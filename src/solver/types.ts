export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Line {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

export interface Segment {
  readonly p1: Point;
  readonly p2: Point;
  readonly line: Line;
}

export type FoldType =
  | 'edge-to-edge'
  | 'corner-to-corner'
  | 'point-to-point'
  | 'point-to-line'
  | 'line-to-line';

export interface FoldReference {
  kind: 'point' | 'line';
  index: number;
  label: string;
}

export interface Fold {
  type: FoldType;
  creaseLine: Line;
  description: string;
  ref1: FoldReference;
  ref2: FoldReference;
}

export interface FoldState {
  width: number;
  height: number;
  points: Point[];
  lines: Line[];
  segments: Segment[];
  foldHistory: Fold[];
}

export type Target =
  | { type: 'point'; x: number; y: number }
  | { type: 'lineX'; x: number }
  | { type: 'lineY'; y: number };

export interface SolveParams {
  width: number;
  height: number;
  target: Target;
  tolerance: number;
  maxDepth?: number;
  maxSolutions?: number;
}

export interface Solution {
  folds: Fold[];
  foldCount: number;
  achievedPoint?: Point;
  achievedLine?: Line;
  error: number;
  robustnessScore: number;
  simplicityScore: number;
  rank: number;
}

export type WorkerRequest =
  | { type: 'solve'; id: string; params: SolveParams }
  | { type: 'cancel'; id: string };

export type WorkerResponse =
  | { type: 'progress'; id: string; depth: number; solutionsFound: number }
  | { type: 'solution'; id: string; solution: Solution }
  | { type: 'complete'; id: string; solutions: Solution[] }
  | { type: 'error'; id: string; message: string };

export interface SearchProgress {
  depth: number;
  solutionsFound: number;
}
