export type WorkflowStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "timeout"
  | "cancelled"
  | "offline";

export type WorkflowErrorKind =
  | "network"
  | "server"
  | "client"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "rate_limit"
  | "offline"
  | "unknown";

export type ErrorSeverity =
  | "info"
  | "warning"
  | "recoverable"
  | "critical";

export interface WorkflowError {
  kind: WorkflowErrorKind;
  message: string;
  retryable: boolean;
  code?: string;
  requestId?: string;
  severity?: ErrorSeverity;
  status?: number;
}

export interface WorkflowState<T = unknown> {
  status: WorkflowStatus;
  data?: T;
  error?: WorkflowError;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
}

export type WorkflowAction<T = unknown> =
  | { type: "START" }
  | { type: "SUCCEED"; data: T }
  | { type: "SET_EMPTY" }
  | { type: "FAIL"; error: WorkflowError }
  | { type: "TIMEOUT"; error?: WorkflowError }
  | { type: "CANCEL" }
  | { type: "OFFLINE"; error?: WorkflowError }
  | { type: "RETRY" }
  | { type: "RESET" };
