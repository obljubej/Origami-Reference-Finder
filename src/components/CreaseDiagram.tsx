import type { Fold, Point } from '../solver/types';
import { clipLineToPaper } from '../solver/geometry';

const CREASE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316',
];

interface CreaseDiagramProps {
  width: number;
  height: number;
  folds: Fold[];
  targetPoint?: Point;
  targetLine?: { type: 'lineX' | 'lineY'; value: number };
  achievedPoint?: Point;
  svgWidth?: number;
}

export function CreaseDiagram({
  width, height, folds, targetPoint, targetLine, achievedPoint, svgWidth = 320,
}: CreaseDiagramProps) {
  const margin = 30;
  const aspect = height / width;
  const drawWidth = svgWidth - 2 * margin;
  const drawHeight = drawWidth * aspect;
  const svgHeight = drawHeight + 2 * margin;

  const tx = (px: number) => margin + (px / width) * drawWidth;
  const ty = (py: number) => margin + drawHeight - (py / height) * drawHeight;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full max-w-sm border border-gray-200 rounded bg-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={margin} y={margin} width={drawWidth} height={drawHeight}
        fill="#fefefe" stroke="#374151" strokeWidth="1.5" />

      <text x={tx(0) - 4} y={ty(0) + 14} className="text-[9px] fill-gray-400" textAnchor="end">
        (0,0)
      </text>
      <text x={tx(width) + 4} y={ty(0) + 14} className="text-[9px] fill-gray-400" textAnchor="start">
        ({width},{0})
      </text>
      <text x={tx(width) + 4} y={ty(height) - 4} className="text-[9px] fill-gray-400" textAnchor="start">
        ({width},{height})
      </text>
      <text x={tx(0) - 4} y={ty(height) - 4} className="text-[9px] fill-gray-400" textAnchor="end">
        (0,{height})
      </text>

      {folds.map((fold, i) => {
        const seg = clipLineToPaper(fold.creaseLine, width, height);
        if (!seg) return null;
        const color = CREASE_COLORS[i % CREASE_COLORS.length]!;
        return (
          <g key={i}>
            <line x1={tx(seg.p1.x)} y1={ty(seg.p1.y)} x2={tx(seg.p2.x)} y2={ty(seg.p2.y)}
              stroke={color} strokeWidth="1.5" strokeDasharray="6,3" />
            <circle cx={(tx(seg.p1.x) + tx(seg.p2.x)) / 2} cy={(ty(seg.p1.y) + ty(seg.p2.y)) / 2}
              r="8" fill={color} />
            <text x={(tx(seg.p1.x) + tx(seg.p2.x)) / 2} y={(ty(seg.p1.y) + ty(seg.p2.y)) / 2 + 3.5}
              textAnchor="middle" className="text-[10px] fill-white font-bold">
              {i + 1}
            </text>
          </g>
        );
      })}

      {targetPoint && (
        <circle cx={tx(targetPoint.x)} cy={ty(targetPoint.y)} r="5"
          fill="none" stroke="#ef4444" strokeWidth="2" />
      )}

      {targetLine?.type === 'lineX' && (
        <line x1={tx(targetLine.value)} y1={ty(0)} x2={tx(targetLine.value)} y2={ty(height)}
          stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
      )}
      {targetLine?.type === 'lineY' && (
        <line x1={tx(0)} y1={ty(targetLine.value)} x2={tx(width)} y2={ty(targetLine.value)}
          stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
      )}

      {achievedPoint && (
        <circle cx={tx(achievedPoint.x)} cy={ty(achievedPoint.y)} r="4" fill="#10b981" />
      )}
    </svg>
  );
}
