import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { TargetPreview } from './components/TargetPreview';
import { ResultsPanel } from './components/ResultsPanel';
import { useSolver } from './hooks/useSolver';
import type { SolveParams, Target } from './solver/types';

type TargetMode = 'point' | 'lineX' | 'lineY';

export default function App() {
  const { solutions, isSearching, progress, solve, cancel } = useSolver();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastParams, setLastParams] = useState<SolveParams | null>(null);

  // Lifted input state so TargetPreview can read it live
  const [paperWidth, setPaperWidth] = useState(1);
  const [paperHeight, setPaperHeight] = useState(1);
  const [targetMode, setTargetMode] = useState<TargetMode>('point');
  const [xNorm, setXNorm] = useState(0.3125);
  const [yNorm, setYNorm] = useState(0.7);
  const [tolerancePct, setTolerancePct] = useState(0.5);
  const [maxDepth, setMaxDepth] = useState(6);

  const handleSolve = useCallback(() => {
    const tol = (tolerancePct / 100) * Math.max(paperWidth, paperHeight);

    let target: Target;
    switch (targetMode) {
      case 'point':
        target = { type: 'point', x: xNorm * paperWidth, y: yNorm * paperHeight };
        break;
      case 'lineX':
        target = { type: 'lineX', x: xNorm * paperWidth };
        break;
      case 'lineY':
        target = { type: 'lineY', y: yNorm * paperHeight };
        break;
    }

    const params: SolveParams = {
      width: paperWidth,
      height: paperHeight,
      target,
      tolerance: tol,
      maxDepth,
      maxSolutions: 10,
    };

    setSelectedIndex(null);
    setLastParams(params);
    solve(params);
  }, [paperWidth, paperHeight, targetMode, xNorm, yNorm, tolerancePct, maxDepth, solve]);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev: number | null) => (prev === index ? null : index));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[380px_320px_1fr] gap-6">
        {/* Left: Input controls */}
        <InputPanel
          paperWidth={paperWidth}
          paperHeight={paperHeight}
          targetMode={targetMode}
          xNorm={xNorm}
          yNorm={yNorm}
          tolerancePct={tolerancePct}
          maxDepth={maxDepth}
          onPaperWidthChange={setPaperWidth}
          onPaperHeightChange={setPaperHeight}
          onTargetModeChange={setTargetMode}
          onXNormChange={setXNorm}
          onYNormChange={setYNorm}
          onTolerancePctChange={setTolerancePct}
          onMaxDepthChange={setMaxDepth}
          onSolve={handleSolve}
          isSearching={isSearching}
          onCancel={cancel}
        />

        {/* Center: Live sheet preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <TargetPreview
            paperWidth={paperWidth}
            paperHeight={paperHeight}
            targetMode={targetMode}
            xNorm={xNorm}
            yNorm={yNorm}
            tolerancePct={tolerancePct}
          />
        </div>

        {/* Right: Results */}
        <ResultsPanel
          solutions={solutions}
          isSearching={isSearching}
          progress={progress}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          solveParams={lastParams}
        />
      </main>
    </div>
  );
}
