import { useState, useCallback, useRef } from 'react';
import type { Solution, SolveParams, SearchProgress } from '../solver/types';
import { startSolve, cancelSolve } from '../worker/workerClient';

export interface UseSolverResult {
  solutions: Solution[];
  isSearching: boolean;
  progress: SearchProgress | null;
  solve: (params: SolveParams) => void;
  cancel: () => void;
}

export function useSolver(): UseSolverResult {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const solutionsRef = useRef<Solution[]>([]);

  const solve = useCallback((params: SolveParams) => {
    setSolutions([]);
    solutionsRef.current = [];
    setIsSearching(true);
    setProgress({ depth: 0, solutionsFound: 0 });

    startSolve(params, {
      onSolution: (solution) => {
        solutionsRef.current = [...solutionsRef.current, solution];
        setSolutions(solutionsRef.current);
      },
      onProgress: (prog) => {
        setProgress(prog);
      },
      onComplete: (finalSolutions) => {
        setSolutions(finalSolutions);
        solutionsRef.current = finalSolutions;
        setIsSearching(false);
        setProgress(null);
      },
      onError: (message) => {
        console.error('Solver error:', message);
        setIsSearching(false);
        setProgress(null);
      },
    });
  }, []);

  const cancel = useCallback(() => {
    cancelSolve();
    setIsSearching(false);
    setProgress(null);
  }, []);

  return { solutions, isSearching, progress, solve, cancel };
}
