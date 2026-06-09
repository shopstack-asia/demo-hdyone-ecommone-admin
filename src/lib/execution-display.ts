import type { Execution } from "@/types/domain";
import { ExecutionStatus } from "@/types/enums";

export type ExecutionDisplayStatus =
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "FAILED"
  | "RUNNING"
  | "CANCELLED";

const RUNNING_STATUSES = new Set<ExecutionStatus>([
  ExecutionStatus.CREATED,
  ExecutionStatus.QUEUED,
  ExecutionStatus.RUNNING,
  ExecutionStatus.VALIDATING,
  ExecutionStatus.MAPPING,
  ExecutionStatus.TRANSFORMING,
  ExecutionStatus.ROUTING,
  ExecutionStatus.DELIVERING,
]);

export function getExecutionDisplayStatus(execution: Execution): ExecutionDisplayStatus {
  if (execution.status === ExecutionStatus.CANCELLED) return "CANCELLED";
  if (execution.status === ExecutionStatus.FAILED || execution.status === ExecutionStatus.DLQ) return "FAILED";
  if (RUNNING_STATUSES.has(execution.status)) return "RUNNING";
  if (execution.status === ExecutionStatus.COMPLETED) {
    return execution.recordsFailed > 0 ? "PARTIAL_SUCCESS" : "SUCCESS";
  }
  return "RUNNING";
}

export function getSuccessRate(execution: Execution): number {
  if (execution.recordsProcessed === 0) return 0;
  return (execution.recordsSuccess / execution.recordsProcessed) * 100;
}
