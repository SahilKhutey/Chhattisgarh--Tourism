import type { WorkflowStatus } from "./types";

export type SectionStateMap = Record<string, WorkflowStatus>;

export interface SectionTracker {
  getStatus: (section: string) => WorkflowStatus;
  setStatus: (section: string, status: WorkflowStatus) => void;
  isReady: (section: string) => boolean;
  hasErrors: () => boolean;
  getAll: () => SectionStateMap;
}

export function createSectionTracker(initial: SectionStateMap = {}): SectionTracker {
  const state: SectionStateMap = { ...initial };

  return {
    getStatus(section: string): WorkflowStatus {
      return state[section] || "idle";
    },

    setStatus(section: string, status: WorkflowStatus): void {
      state[section] = status;
    },

    isReady(section: string): boolean {
      const s = state[section];
      return s === "success" || s === "empty";
    },

    hasErrors(): boolean {
      return Object.values(state).some((s) => s === "error" || s === "timeout");
    },

    getAll(): SectionStateMap {
      return { ...state };
    },
  };
}
