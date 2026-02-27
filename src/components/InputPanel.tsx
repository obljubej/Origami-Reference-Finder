import { useCallback } from 'react';

type TargetMode = 'point' | 'lineX' | 'lineY';

interface InputPanelProps {
  paperWidth: number;
  paperHeight: number;
  targetMode: TargetMode;
  xNorm: number;
  yNorm: number;
  tolerancePct: number;
  maxDepth: number;
  onPaperWidthChange: (v: number) => void;
  onPaperHeightChange: (v: number) => void;
  onTargetModeChange: (v: TargetMode) => void;
  onXNormChange: (v: number) => void;
  onYNormChange: (v: number) => void;
  onTolerancePctChange: (v: number) => void;
  onMaxDepthChange: (v: number) => void;
  onSolve: () => void;
  isSearching: boolean;
  onCancel: () => void;
}

export function InputPanel({
  paperWidth,
  paperHeight,
  targetMode,
  xNorm,
  yNorm,
  tolerancePct,
  maxDepth,
  onPaperWidthChange,
  onPaperHeightChange,
  onTargetModeChange,
  onXNormChange,
  onYNormChange,
  onTolerancePctChange,
  onMaxDepthChange,
  onSolve,
  isSearching,
  onCancel,
}: InputPanelProps) {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSolve();
    },
    [onSolve],
  );

  return (
    <aside className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 h-fit">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Parameters</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paper size */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Paper Size
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-500">Width</span>
              <input
                type="number"
                min={0.01}
                step="any"
                value={paperWidth}
                onChange={(e) => onPaperWidthChange(Number(e.target.value))}
                className="mt-0.5 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Height</span>
              <input
                type="number"
                min={0.01}
                step="any"
                value={paperHeight}
                onChange={(e) => onPaperHeightChange(Number(e.target.value))}
                className="mt-0.5 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </label>
          </div>
        </fieldset>

        {/* Target mode */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Target Type
          </legend>
          <div className="flex gap-2">
            {(
              [
                ['point', 'Point (x, y)'],
                ['lineX', 'Vertical Line (x)'],
                ['lineY', 'Horizontal Line (y)'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onTargetModeChange(mode)}
                className={`flex-1 text-xs py-1.5 px-2 rounded border transition-colors ${
                  targetMode === mode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Target coordinates */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Target (normalised 0–1)
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(targetMode === 'point' || targetMode === 'lineX') && (
              <label className="block">
                <span className="text-xs text-gray-500">x</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.001}
                  value={xNorm}
                  onChange={(e) => onXNormChange(Number(e.target.value))}
                  className="mt-0.5 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            )}
            {(targetMode === 'point' || targetMode === 'lineY') && (
              <label className="block">
                <span className="text-xs text-gray-500">y</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.001}
                  value={yNorm}
                  onChange={(e) => onYNormChange(Number(e.target.value))}
                  className="mt-0.5 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            )}
          </div>
        </fieldset>

        {/* Tolerance */}
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">
            Tolerance (±%)
          </span>
          <input
            type="number"
            min={0.01}
            max={10}
            step={0.01}
            value={tolerancePct}
            onChange={(e) => onTolerancePctChange(Number(e.target.value))}
            className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>

        {/* Max folds */}
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Max Folds</span>
          <select
            value={maxDepth}
            onChange={(e) => onMaxDepthChange(Number(e.target.value))}
            className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6 (default)</option>
            <option value={7}>7 (experimental)</option>
          </select>
        </label>

        {/* Submit */}
        {isSearching ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Cancel Search
          </button>
        ) : (
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Find References
          </button>
        )}
      </form>
    </aside>
  );
}
