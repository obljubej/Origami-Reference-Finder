import type { WorkerRequest, WorkerResponse, SolveParams, Solution, SearchProgress } from '../solver/types';

export interface SolverCallbacks {
  onSolution: (solution: Solution) => void;
  onProgress: (progress: SearchProgress) => void;
  onComplete: (solutions: Solution[]) => void;
  onError: (message: string) => void;
}

let worker: Worker | null = null;
let currentId: string | null = null;
let currentCallbacks: SolverCallbacks | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = handleMessage;
    worker.onerror = (e) => {
      currentCallbacks?.onError(e.message ?? 'Worker error');
    };
  }
  return worker;
}

function handleMessage(e: MessageEvent<WorkerResponse>) {
  const msg = e.data;
  if (msg.id !== currentId) return;

  switch (msg.type) {
    case 'solution':
      currentCallbacks?.onSolution(msg.solution);
      break;
    case 'progress':
      currentCallbacks?.onProgress({ depth: msg.depth, solutionsFound: msg.solutionsFound });
      break;
    case 'complete':
      currentCallbacks?.onComplete(msg.solutions);
      currentId = null;
      break;
    case 'error':
      currentCallbacks?.onError(msg.message);
      currentId = null;
      break;
  }
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startSolve(params: SolveParams, callbacks: SolverCallbacks): void {
  const w = getWorker();

  if (currentId) {
    const cancelMsg: WorkerRequest = { type: 'cancel', id: currentId };
    w.postMessage(cancelMsg);
  }

  currentId = genId();
  currentCallbacks = callbacks;

  const solveMsg: WorkerRequest = { type: 'solve', id: currentId, params };
  w.postMessage(solveMsg);
}

export function cancelSolve(): void {
  if (currentId && worker) {
    const cancelMsg: WorkerRequest = { type: 'cancel', id: currentId };
    worker.postMessage(cancelMsg);
    currentId = null;
  }
}
