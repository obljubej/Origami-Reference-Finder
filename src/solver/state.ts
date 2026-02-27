import type { Point, Line, Segment, Fold, FoldState } from './types';
import {
  pt,
  normaliseLine,
  clipLineToPaper,
  intersectLL,
  pointOnPaper,
  findDuplicatePoint,
  findDuplicateLine,
  linesEqual,
} from './geometry';

export function initialState(w: number, h: number): FoldState {
  const points: Point[] = [
    pt(0, 0),
    pt(w, 0),
    pt(w, h),
    pt(0, h),
  ];

  const bottom = normaliseLine(0, 1, 0);
  const right = normaliseLine(1, 0, -w);
  const top = normaliseLine(0, 1, -h);
  const left = normaliseLine(1, 0, 0);

  const lines: Line[] = [bottom, right, top, left];

  const segments: Segment[] = [
    { p1: points[0]!, p2: points[1]!, line: bottom },
    { p1: points[1]!, p2: points[2]!, line: right },
    { p1: points[2]!, p2: points[3]!, line: top },
    { p1: points[3]!, p2: points[0]!, line: left },
  ];

  return { width: w, height: h, points, lines, segments, foldHistory: [] };
}

export function applyFold(state: FoldState, fold: Fold): FoldState {
  const crease = fold.creaseLine;

  if (findDuplicateLine(state.lines, crease) !== -1) {
    return { ...state, foldHistory: [...state.foldHistory, fold] };
  }

  const seg = clipLineToPaper(crease, state.width, state.height);
  if (!seg) return state;

  const newPoints = [...state.points];
  const newLines = [...state.lines, crease];
  const newSegments = [...state.segments, seg];

  const addPoint = (p: Point) => {
    if (
      pointOnPaper(p, state.width, state.height) &&
      findDuplicatePoint(newPoints, p) === -1
    ) {
      newPoints.push(p);
    }
  };

  addPoint(seg.p1);
  addPoint(seg.p2);

  for (const existingLine of state.lines) {
    if (linesEqual(existingLine, crease)) continue;
    const ip = intersectLL(crease, existingLine);
    if (ip) addPoint(ip);
  }

  return {
    width: state.width,
    height: state.height,
    points: newPoints,
    lines: newLines,
    segments: newSegments,
    foldHistory: [...state.foldHistory, fold],
  };
}

export function stateHash(state: FoldState): string {
  const creases = state.lines.slice(4);
  const snap = (v: number) => Math.round(v * 1e8) / 1e8;
  const sorted = creases
    .map((l) => `${snap(l.a)},${snap(l.b)},${snap(l.c)}`)
    .sort();
  return sorted.join('|');
}

const CORNER_LABELS = ['bottom-left corner', 'bottom-right corner', 'top-right corner', 'top-left corner'];
const EDGE_LABELS = ['bottom edge', 'right edge', 'top edge', 'left edge'];

export function pointLabel(index: number, state: FoldState): string {
  if (index < 4) return CORNER_LABELS[index]!;
  const p = state.points[index];
  if (!p) return `point #${index}`;
  const x = Math.round(p.x * 10000) / 10000;
  const y = Math.round(p.y * 10000) / 10000;
  return `point (${x}, ${y})`;
}

export function lineLabel(index: number, _state: FoldState): string {
  if (index < 4) return EDGE_LABELS[index]!;
  return `crease #${index - 3}`;
}

export function creaseCount(state: FoldState): number {
  return state.lines.length - 4;
}
