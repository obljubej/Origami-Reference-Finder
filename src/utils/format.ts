export function fmt(n: number, digits = 6): string {
  return parseFloat(n.toPrecision(digits)).toString();
}

export function fmtPoint(x: number, y: number): string {
  return `(${fmt(x)}, ${fmt(y)})`;
}

export function fmtErrorPct(error: number, ref: number): string {
  if (ref === 0) return '0%';
  return `${(Math.abs(error / ref) * 100).toFixed(3)}%`;
}
