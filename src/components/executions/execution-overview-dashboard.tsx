import { ExecutionHealthSummary } from "./execution-health-summary";
import { ExecutionKpiCards } from "./execution-kpi-cards";
import { ExecutionOperationalInsight } from "./execution-operational-insight";
import { ExecutionPipelineFlow } from "./execution-pipeline-flow";
import { ExecutionProcessingBreakdown } from "./execution-processing-breakdown";
import type { Execution, Integration, Provider } from "@/types/domain";

interface ExecutionOverviewDashboardProps {
  execution: Execution;
  integration: Integration | null;
  sourceLabel: string;
  destinationLabel: string;
  sourceProvider?: Provider | null;
  destinationProvider?: Provider | null;
  batchSize?: number;
  onNavigateTab?: (tab: string) => void;
}

export function ExecutionOverviewDashboard({
  execution,
  integration,
  sourceLabel,
  destinationLabel,
  sourceProvider,
  destinationProvider,
  batchSize,
  onNavigateTab,
}: ExecutionOverviewDashboardProps) {
  return (
    <div className="space-y-6">
      <ExecutionKpiCards execution={execution} />
      <ExecutionHealthSummary execution={execution} />
      <ExecutionPipelineFlow
        execution={execution}
        sourceLabel={sourceLabel}
        destinationLabel={destinationLabel}
        sourceProvider={sourceProvider}
        destinationProvider={destinationProvider}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ExecutionProcessingBreakdown execution={execution} batchSize={batchSize} />
        <ExecutionOperationalInsight execution={execution} onNavigateTab={onNavigateTab} />
      </div>
      {integration && (
        <p className="text-xs text-muted-foreground">
          Integration policy: batch size {integration.executionPolicy?.batchSize ?? "—"} records per process, chunk size{" "}
          {integration.executionPolicy?.chunkSize ?? "—"} records per chunk, max parallel chunks{" "}
          {integration.executionPolicy?.maxParallelChunks ?? "—"}
        </p>
      )}
    </div>
  );
}
