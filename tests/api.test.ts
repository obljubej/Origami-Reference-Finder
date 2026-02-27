import { describe, it, expect } from 'vitest';
import { solvePoint, solveLineX, solveLineY } from '../src/solver/api';

describe('solvePoint', () => {
  it('finds center point (0.5, 0.5) in 1 fold on unit square', () => {
    const solutions = solvePoint(1, 1, 0.5, 0.5, 0.01, { maxDepth: 3 });
    expect(solutions.length).toBeGreaterThan(0);
    // The center should be findable in at most 2 folds (1 fold creates a midline,
    // but the center point requires 2 folds to get the intersection)
    const best = solutions[0]!;
    expect(best.foldCount).toBeLessThanOrEqual(2);
    expect(best.error).toBeLessThan(0.01);
  });

  it('finds quarter point (0.25, 0.5) in ≤ 3 folds', () => {
    const solutions = solvePoint(1, 1, 0.25, 0.5, 0.01, { maxDepth: 4 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBeLessThanOrEqual(3);
    expect(best.error).toBeLessThan(0.01);
  });

  it('finds corner points with 0 folds', () => {
    const solutions = solvePoint(1, 1, 0, 0, 0.01, { maxDepth: 2 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBe(0);
    expect(best.error).toBeLessThan(0.001);
  });
});

describe('solveLineX', () => {
  it('finds center vertical line x=0.5 in 1 fold', () => {
    const solutions = solveLineX(1, 1, 0.5, 0.01, { maxDepth: 3 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBeLessThanOrEqual(1);
    expect(best.error).toBeLessThan(0.01);
  });

  it('finds x=0 (left edge) with 0 folds', () => {
    const solutions = solveLineX(1, 1, 0, 0.01, { maxDepth: 2 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBe(0);
  });
});

describe('solveLineY', () => {
  it('finds center horizontal line y=0.5 in 1 fold', () => {
    const solutions = solveLineY(1, 1, 0.5, 0.01, { maxDepth: 3 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBeLessThanOrEqual(1);
    expect(best.error).toBeLessThan(0.01);
  });
});

describe('Rectangle paper', () => {
  it('finds references on 2:1 rectangle', () => {
    const solutions = solveLineX(2, 1, 1.0, 0.02, { maxDepth: 3 });
    expect(solutions.length).toBeGreaterThan(0);
    const best = solutions[0]!;
    expect(best.foldCount).toBeLessThanOrEqual(1);
    expect(best.error).toBeLessThan(0.02);
  });
});
