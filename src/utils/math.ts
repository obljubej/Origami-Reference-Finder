export const EPSILON = 1e-10;

export function approxEqual(a: number, b: number, eps = EPSILON): boolean {
  return Math.abs(a - b) <= eps;
}

export function snapZero(v: number, eps = EPSILON): number {
  return Math.abs(v) < eps ? 0 : v;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
