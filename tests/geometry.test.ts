import { describe, it, expect } from 'vitest';
import {
  pt,
  pointsEqual,
  distancePP,
  midpoint,
  lineFromPoints,
  perpendicularBisector,
  angleBisectors,
  parallelBisector,
  linesEqual,
  linesParallel,
  distancePL,
  intersectLL,
  reflectPoint,
  clipLineToPaper,
  pointOnPaper,
  normaliseLine,
} from '../src/solver/geometry';

describe('Point helpers', () => {
  it('pt creates a point', () => {
    const p = pt(3, 4);
    expect(p.x).toBe(3);
    expect(p.y).toBe(4);
  });

  it('pointsEqual detects equal points', () => {
    expect(pointsEqual(pt(1, 2), pt(1, 2))).toBe(true);
    // Within epsilon (1e-10): 5e-11 difference
    expect(pointsEqual(pt(1, 2), pt(1, 2.00000000005))).toBe(true);
    // Well outside epsilon
    expect(pointsEqual(pt(1, 2), pt(1, 3))).toBe(false);
    expect(pointsEqual(pt(1, 2), pt(1, 2.001))).toBe(false);
  });

  it('distancePP computes Euclidean distance', () => {
    expect(distancePP(pt(0, 0), pt(3, 4))).toBeCloseTo(5);
    expect(distancePP(pt(1, 1), pt(1, 1))).toBe(0);
  });

  it('midpoint computes the midpoint', () => {
    const m = midpoint(pt(0, 0), pt(4, 6));
    expect(m.x).toBeCloseTo(2);
    expect(m.y).toBeCloseTo(3);
  });
});

describe('Line construction', () => {
  it('lineFromPoints creates a normalised line', () => {
    const l = lineFromPoints(pt(0, 0), pt(1, 0));
    // Horizontal line y = 0: direction (1,0), normal (-dy, dx) = (0, 1)
    // Normalised: (0, 1, 0)
    expect(l.a).toBeCloseTo(0);
    expect(l.b).toBeCloseTo(1);
    expect(l.c).toBeCloseTo(0);
  });

  it('lineFromPoints for vertical line', () => {
    const l = lineFromPoints(pt(3, 0), pt(3, 5));
    // Direction (0, 5), normal (-5, 0) → normalised (1, 0, -3)
    expect(l.a).toBeCloseTo(1);
    expect(l.b).toBeCloseTo(0);
    expect(l.c).toBeCloseTo(-3);
  });

  it('perpendicularBisector of two points', () => {
    const l = perpendicularBisector(pt(0, 0), pt(2, 0));
    // Midpoint (1, 0), direction of bisector is perpendicular to (2, 0)
    // Bisector is x = 1: 1x + 0y - 1 = 0
    expect(l.a).toBeCloseTo(1);
    expect(l.b).toBeCloseTo(0);
    expect(l.c).toBeCloseTo(-1);
  });

  it('perpendicularBisector of diagonal points', () => {
    const l = perpendicularBisector(pt(0, 0), pt(1, 1));
    // Midpoint (0.5, 0.5), normal direction (1, 1)
    // Line: x + y - 1 = 0 (normalised)
    const len = Math.SQRT2;
    expect(l.a).toBeCloseTo(1 / len);
    expect(l.b).toBeCloseTo(1 / len);
    expect(l.c).toBeCloseTo(-1 / len);
  });
});

describe('Line queries', () => {
  it('linesEqual detects equal lines', () => {
    const l1 = normaliseLine(1, 0, -1);
    const l2 = normaliseLine(2, 0, -2); // same line, different scale
    expect(linesEqual(l1, l2)).toBe(true);
  });

  it('linesParallel detects parallel lines', () => {
    const l1 = normaliseLine(0, 1, 0);   // y = 0
    const l2 = normaliseLine(0, 1, -1);  // y = 1
    expect(linesParallel(l1, l2)).toBe(true);
  });

  it('distancePL computes signed distance', () => {
    const l = normaliseLine(0, 1, 0); // y = 0
    expect(distancePL(pt(5, 3), l)).toBeCloseTo(3);
    expect(distancePL(pt(5, -2), l)).toBeCloseTo(-2);
  });
});

describe('Intersections', () => {
  it('intersectLL finds intersection of perpendicular lines', () => {
    const l1 = normaliseLine(1, 0, -1); // x = 1
    const l2 = normaliseLine(0, 1, -2); // y = 2
    const p = intersectLL(l1, l2);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(1);
    expect(p!.y).toBeCloseTo(2);
  });

  it('intersectLL returns null for parallel lines', () => {
    const l1 = normaliseLine(0, 1, 0);
    const l2 = normaliseLine(0, 1, -1);
    expect(intersectLL(l1, l2)).toBeNull();
  });

  it('intersectLL for diagonal lines', () => {
    const l1 = lineFromPoints(pt(0, 0), pt(1, 1)); // y = x
    const l2 = lineFromPoints(pt(0, 1), pt(1, 0)); // y = 1 - x
    const p = intersectLL(l1, l2);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(0.5);
    expect(p!.y).toBeCloseTo(0.5);
  });
});

describe('Reflections', () => {
  it('reflectPoint over vertical line', () => {
    const l = normaliseLine(1, 0, -0.5); // x = 0.5
    const p = reflectPoint(pt(0, 0), l);
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(0);
  });

  it('reflectPoint over horizontal line', () => {
    const l = normaliseLine(0, 1, -0.5); // y = 0.5
    const p = reflectPoint(pt(0, 0), l);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });
});

describe('Paper clipping', () => {
  it('clips a vertical line to paper', () => {
    const l = normaliseLine(1, 0, -0.5); // x = 0.5
    const seg = clipLineToPaper(l, 1, 1);
    expect(seg).not.toBeNull();
    // Should go from (0.5, 0) to (0.5, 1)
    const xs = [seg!.p1.x, seg!.p2.x];
    const ys = [seg!.p1.y, seg!.p2.y].sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(0.5);
    expect(xs[1]).toBeCloseTo(0.5);
    expect(ys[0]).toBeCloseTo(0);
    expect(ys[1]).toBeCloseTo(1);
  });

  it('clips a diagonal line to paper', () => {
    const l = lineFromPoints(pt(0, 0), pt(1, 1));
    const seg = clipLineToPaper(l, 1, 1);
    expect(seg).not.toBeNull();
  });

  it('returns null for line outside paper', () => {
    const l = normaliseLine(1, 0, -5); // x = 5, paper is [0,1]×[0,1]
    const seg = clipLineToPaper(l, 1, 1);
    expect(seg).toBeNull();
  });

  it('pointOnPaper checks bounds', () => {
    expect(pointOnPaper(pt(0.5, 0.5), 1, 1)).toBe(true);
    expect(pointOnPaper(pt(-0.1, 0.5), 1, 1)).toBe(false);
    expect(pointOnPaper(pt(0.5, 1.1), 1, 1)).toBe(false);
  });
});

describe('Angle bisectors', () => {
  it('finds bisectors of perpendicular lines', () => {
    const l1 = normaliseLine(1, 0, 0); // x = 0
    const l2 = normaliseLine(0, 1, 0); // y = 0
    const bisectors = angleBisectors(l1, l2);
    expect(bisectors.length).toBe(2);
  });

  it('parallelBisector finds midline', () => {
    const l1 = normaliseLine(0, 1, 0);   // y = 0
    const l2 = normaliseLine(0, 1, -1);  // y = 1
    const mid = parallelBisector(l1, l2);
    expect(mid).not.toBeNull();
    // Should be y = 0.5: 0x + 1y - 0.5 = 0
    expect(mid!.a).toBeCloseTo(0);
    expect(mid!.b).toBeCloseTo(1);
    expect(mid!.c).toBeCloseTo(-0.5);
  });
});
