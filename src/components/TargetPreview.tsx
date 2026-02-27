/**
 * Live preview of the paper sheet with the current target point/line.
 * Updates in real-time as the user changes input values.
 */

interface TargetPreviewProps {
  paperWidth: number;
  paperHeight: number;
  targetMode: 'point' | 'lineX' | 'lineY';
  xNorm: number;
  yNorm: number;
  tolerancePct: number;
}

export function TargetPreview({
  paperWidth,
  paperHeight,
  targetMode,
  xNorm,
  yNorm,
  tolerancePct,
}: TargetPreviewProps) {
  const margin = 36;
  const svgWidth = 320;
  const aspect = paperHeight / paperWidth;
  const drawWidth = svgWidth - 2 * margin;
  const drawHeight = drawWidth * aspect;
  const svgHeight = drawHeight + 2 * margin;

  // Transform normalised coords → SVG coords (Y-flip)
  const tx = (nx: number) => margin + nx * drawWidth;
  const ty = (ny: number) => margin + drawHeight - ny * drawHeight;

  // Tolerance band in SVG units
  const tolFrac = tolerancePct / 100;
  const tolPxX = tolFrac * drawWidth;
  const tolPxY = tolFrac * drawHeight;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Sheet Preview</h3>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-xs mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Paper rectangle */}
        <rect
          x={margin}
          y={margin}
          width={drawWidth}
          height={drawHeight}
          fill="#fafafa"
          stroke="#374151"
          strokeWidth="1.5"
        />

        {/* Grid lines (quarters) */}
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={`grid-${f}`}>
            <line
              x1={tx(f)}
              y1={ty(0)}
              x2={tx(f)}
              y2={ty(1)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
            <line
              x1={tx(0)}
              y1={ty(f)}
              x2={tx(1)}
              y2={ty(f)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Corner labels */}
        <text
          x={tx(0)}
          y={ty(0) + 14}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          (0, 0)
        </text>
        <text
          x={tx(1)}
          y={ty(0) + 14}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          ({paperWidth}, 0)
        </text>
        <text
          x={tx(1)}
          y={ty(1) - 6}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          ({paperWidth}, {paperHeight})
        </text>
        <text
          x={tx(0)}
          y={ty(1) - 6}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          (0, {paperHeight})
        </text>

        {/* Tolerance band */}
        {targetMode === 'point' && (
          <rect
            x={tx(xNorm) - tolPxX}
            y={ty(yNorm) - tolPxY}
            width={tolPxX * 2}
            height={tolPxY * 2}
            fill="#ef4444"
            fillOpacity="0.08"
            stroke="#ef4444"
            strokeWidth="0.5"
            strokeDasharray="3,2"
            rx="2"
          />
        )}
        {targetMode === 'lineX' && (
          <rect
            x={tx(xNorm) - tolPxX}
            y={ty(1)}
            width={tolPxX * 2}
            height={drawHeight}
            fill="#ef4444"
            fillOpacity="0.06"
          />
        )}
        {targetMode === 'lineY' && (
          <rect
            x={tx(0)}
            y={ty(yNorm) - tolPxY}
            width={drawWidth}
            height={tolPxY * 2}
            fill="#ef4444"
            fillOpacity="0.06"
          />
        )}

        {/* Target point */}
        {targetMode === 'point' && (
          <>
            {/* Crosshair */}
            <line
              x1={tx(xNorm) - 8}
              y1={ty(yNorm)}
              x2={tx(xNorm) + 8}
              y2={ty(yNorm)}
              stroke="#ef4444"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1={tx(xNorm)}
              y1={ty(yNorm) - 8}
              x2={tx(xNorm)}
              y2={ty(yNorm) + 8}
              stroke="#ef4444"
              strokeWidth="1"
              opacity="0.6"
            />
            <circle
              cx={tx(xNorm)}
              cy={ty(yNorm)}
              r="4"
              fill="#ef4444"
            />
          </>
        )}

        {/* Target vertical line */}
        {targetMode === 'lineX' && (
          <line
            x1={tx(xNorm)}
            y1={ty(0)}
            x2={tx(xNorm)}
            y2={ty(1)}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6,3"
          />
        )}

        {/* Target horizontal line */}
        {targetMode === 'lineY' && (
          <line
            x1={tx(0)}
            y1={ty(yNorm)}
            x2={tx(1)}
            y2={ty(yNorm)}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6,3"
          />
        )}

        {/* Coordinate label */}
        {targetMode === 'point' && (
          <text
            x={tx(xNorm) + 8}
            y={ty(yNorm) - 8}
            className="text-[9px] fill-red-600 font-medium"
          >
            ({(xNorm * paperWidth).toFixed(4)}, {(yNorm * paperHeight).toFixed(4)})
          </text>
        )}
        {targetMode === 'lineX' && (
          <text
            x={tx(xNorm) + 6}
            y={ty(0.5)}
            className="text-[9px] fill-red-600 font-medium"
          >
            x = {(xNorm * paperWidth).toFixed(4)}
          </text>
        )}
        {targetMode === 'lineY' && (
          <text
            x={tx(0.5)}
            y={ty(yNorm) - 6}
            textAnchor="middle"
            className="text-[9px] fill-red-600 font-medium"
          >
            y = {(yNorm * paperHeight).toFixed(4)}
          </text>
        )}

        {/* Axis labels */}
        <text
          x={tx(0.5)}
          y={svgHeight - 4}
          textAnchor="middle"
          className="text-[9px] fill-gray-500"
        >
          x
        </text>
        <text
          x={8}
          y={ty(0.5) + 3}
          textAnchor="middle"
          className="text-[9px] fill-gray-500"
        >
          y
        </text>
      </svg>

      {/* Coordinate readout */}
      <div className="mt-2 text-xs text-gray-500 text-center space-y-0.5">
        {targetMode === 'point' && (
          <p>
            Target: <span className="font-mono text-red-600">({(xNorm * paperWidth).toFixed(4)}, {(yNorm * paperHeight).toFixed(4)})</span>
          </p>
        )}
        {targetMode === 'lineX' && (
          <p>
            Target: <span className="font-mono text-red-600">x = {(xNorm * paperWidth).toFixed(4)}</span>
          </p>
        )}
        {targetMode === 'lineY' && (
          <p>
            Target: <span className="font-mono text-red-600">y = {(yNorm * paperHeight).toFixed(4)}</span>
          </p>
        )}
        <p>Tolerance: ±{tolerancePct}%</p>
      </div>
    </div>
  );
}
