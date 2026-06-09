import type { Execution, ExecutionStage } from "@/types/domain";

const DLQ_ELIGIBLE_FAILURE_STAGES = new Set<ExecutionStage["stageId"]>([
  "VALIDATION",
  "MAPPING",
  "TRANSFORMATION",
  "DELIVERY",
]);

export function getExecutionFailureStageId(execution: Execution): ExecutionStage["stageId"] | undefined {
  return (
    execution.errorSummary?.failureStageId ??
    execution.operationalInsight.failureAnalysis?.failureStageId ??
    execution.executionStages.find((stage) => stage.status === "FAILED")?.stageId
  );
}

/** Source/file/API read failures never produce DLQ records. */
export function isDlqEligibleFailure(failureStageId?: ExecutionStage["stageId"]): boolean {
  if (!failureStageId) return false;
  return DLQ_ELIGIBLE_FAILURE_STAGES.has(failureStageId);
}

export function getExecutionDlqRecordCount(execution: Execution): number {
  if (!isDlqEligibleFailure(getExecutionFailureStageId(execution))) return 0;
  return execution.dlqRecordCount;
}
