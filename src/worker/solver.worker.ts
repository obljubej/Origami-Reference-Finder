import type { WorkerRequest, WorkerResponse, Solution } from '../solver/types';
import { search } from '../solver/search';

let cancelledIds = new Set<string>();

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;

  if (msg.type === 'cancel') {
    cancelledIds.add(msg.id);
    return;
  }

  if (msg.type === 'solve') {
    const { id, params } = msg;
    cancelledIds.delete(id);

    try {
      const solutions = search(params, {
        onSolution: (solution: Solution) => {
          postResponse({ type: 'solution', id, solution });
        },
        onProgress: (depth: number, solutionsFound: number) => {
          postResponse({ type: 'progress', id, depth, solutionsFound });
        },
        shouldCancel: () => cancelledIds.has(id),
      });

      if (!cancelledIds.has(id)) {
        postResponse({ type: 'complete', id, solutions });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      postResponse({ type: 'error', id, message });
    }
  }
};

function postResponse(msg: WorkerResponse) {
  self.postMessage(msg);
}
