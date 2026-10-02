export interface RequestTracker {
  nextId: () => number;
  isCurrent: (id: number) => boolean;
  abortCurrent: () => void;
  getSignal: () => AbortSignal;
}

export function createRequestTracker(): RequestTracker {
  let currentId = 0;
  let activeController: AbortController | null = null;

  return {
    nextId(): number {
      if (activeController) {
        activeController.abort("superseded");
      }
      activeController = new AbortController();
      currentId += 1;
      return currentId;
    },

    isCurrent(id: number): boolean {
      return id === currentId;
    },

    abortCurrent(): void {
      if (activeController) {
        activeController.abort("cancelled");
        activeController = null;
      }
    },

    getSignal(): AbortSignal {
      if (!activeController) {
        activeController = new AbortController();
      }
      return activeController.signal;
    },
  };
}
