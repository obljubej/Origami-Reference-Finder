import type { Point, Line, Segment } from './types';
import { EPSILON, approxEqual, snapZero } from '../utils/math';

export function pt(x: number, y: number): Point {
  return { x, y };
}

export function pointsEqual(a: Point, b: Point, eps = EPSILON): boolean {
  return approxEqual(a.x, b.x, eps) && approxEqual(a.y, b.y, eps);
}

export function distancePP(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
  return pt((a.x + b.x) / 2, (a.y + b.y) / 2);
}

export function normaliseLine(a: number, b: number, c: number): Line {
  const len = Math.hypot(a, b);
  if (len < EPSILON) throw new Error('Degenerate line (a=b=0)');
  let na = a / len;
  let nb = b / len;
  let nc = c / len;
  if (na < -EPSILON || (approxEqual(na, 0) && nb < -EPSILON)) {
    na = -na;
    nb = -nb;
    nc = -nc;
  }
  return { a: snapZero(na), b: snapZero(nb), c: snapZero(nc) };
}

export function lineFromPoints(p1: Point, p2: Point): Line {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a = -dy;
  const b = dx;
  const c = -(a * p1.x + b * p1.y);
  return normaliseLine(a, b, c);
}

export function perpendicularBisector(p1: Point, p2: Point): Line {
  const mid = midpoint(p1, p2);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a = dx;
  const b = dy;
  const c = -(a * mid.x + b * mid.y);
  return normaliseLine(a, b, c);
}

export function angleBisectors(l1: Line, l2: Line): Line[] {
  const results: Line[] = [];

  const a1 = l1.a - l2.a;
  const b1 = l1.b - l2.b;
  const c1 = l1.c - l2.c;
  if (Math.hypot(a1, b1) > EPSILON) {
    results.push(normaliseLine(a1, b1, c1));
  }

  const a2 = l1.a + l2.a;
  const b2 = l1.b + l2.b;
  const c2 = l1.c + l2.c;
  if (Math.hypot(a2, b2) > EPSILON) {
    results.push(normaliseLine(a2, b2, c2));
  }

  return results;
}

export function parallelBisector(l1: Line, l2: Line): Line | null {
  if (!approxEqual(l1.a, l2.a) || !approxEqual(l1.b, l2.b)) {
    if (!approxEqual(l1.a, -l2.a) || !approxEqual(l1.b, -l2.b)) {
      return null;
    }
    return normaliseLine(l1.a, l1.b, (l1.c - l2.c) / 2);
  }
  if (approxEqual(l1.c, l2.c)) return null;
  return normaliseLine(l1.a, l1.b, (l1.c + l2.c) / 2);
}

export function linesEqual(a: Line, b: Line, eps = EPSILON): boolean {
  return (
    approxEqual(a.a, b.a, eps) &&
    approxEqual(a.b, b.b, eps) &&
    approxEqual(a.c, b.c, eps)
  );
}

export function linesParallel(a: Line, b: Line, eps = EPSILON): boolean {
  return approxEqual(Math.abs(a.a * b.b - a.b * b.a), 0, eps);
}

export function distancePL(p: Point, l: Line): number {
  return l.a * p.x + l.b * p.y + l.c;
}

export function absDistancePL(p: Point, l: Line): number {
  return Math.abs(distancePL(p, l));
}

export function intersectLL(l1: Line, l2: Line): Point | null {
  const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < EPSILON) return null;
  const x = (l1.b * l2.c - l2.b * l1.c) / det;
  const y = (l2.a * l1.c - l1.a * l2.c) / det;
  return pt(snapZero(x), snapZero(y));
}

export function reflectPoint(p: Point, l: Line): Point {
  const d = distancePL(p, l);
  return pt(p.x - 2 * d * l.a, p.y - 2 * d * l.b);
}

export function clipLineToPaper(l: Line, w: number, h: number): Segment | null {
  const candidates: Point[] = [];

  if (Math.abs(l.a) > EPSILON) {
    const x = -(l.b * 0 + l.c) / l.a;
    if (x >= -EPSILON && x <= w + EPSILON) {
      candidates.push(pt(Math.max(0, Math.min(w, x)), 0));
    }
  } else if (Math.abs(l.c) < EPSILON) {
    candidates.push(pt(0, 0));
    candidates.push(pt(w, 0));
  }

  if (Math.abs(l.a) > EPSILON) {
    const x = -(l.b * h + l.c) / l.a;
    if (x >= -EPSILON && x <= w + EPSILON) {
      candidates.push(pt(Math.max(0, Math.min(w, x)), h));
    }
  } else if (Math.abs(l.b * h + l.c) < EPSILON) {
    candidates.push(pt(0, h));
    candidates.push(pt(w, h));
  }

  if (Math.abs(l.b) > EPSILON) {
    const y = -(l.a * 0 + l.c) / l.b;
    if (y >= -EPSILON && y <= h + EPSILON) {
      candidates.push(pt(0, Math.max(0, Math.min(h, y))));
    }
  }

  if (Math.abs(l.b) > EPSILON) {
    const y = -(l.a * w + l.c) / l.b;
    if (y >= -EPSILON && y <= h + EPSILON) {
      candidates.push(pt(w, Math.max(0, Math.min(h, y))));
    }
  }

  const unique: Point[] = [];
  for (const c of candidates) {
    if (!unique.some((u) => pointsEqual(u, c))) {
      unique.push(c);
    }
  }

  if (unique.length < 2) return null;

  let best: [Point, Point] = [unique[0]!, unique[1]!];
  let bestDist = distancePP(best[0], best[1]);
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const d = distancePP(unique[i]!, unique[j]!);
      if (d > bestDist) {
        best = [unique[i]!, unique[j]!];
        bestDist = d;
      }
    }
  }

  if (bestDist < EPSILON) return null;

  return { p1: best[0], p2: best[1], line: l };
}

export function pointOnPaper(p: Point, w: number, h: number, eps = EPSILON): boolean {
  return p.x >= -eps && p.x <= w + eps && p.y >= -eps && p.y <= h + eps;
}

export function lineIntersectsPaper(l: Line, w: number, h: number): boolean {
  return clipLineToPaper(l, w, h) !== null;
}

export function findDuplicatePoint(points: Point[], p: Point, eps = EPSILON): number {
  for (let i = 0; i < points.length; i++) {
    if (pointsEqual(points[i]!, p, eps)) return i;
  }
  return -1;
}

export function findDuplicateLine(lines: Line[], l: Line, eps = EPSILON): number {
  for (let i = 0; i < lines.length; i++) {
    if (linesEqual(lines[i]!, l, eps)) return i;
  }
  return -1;
}
