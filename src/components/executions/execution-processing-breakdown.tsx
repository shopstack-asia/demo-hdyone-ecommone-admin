import { StatusBadge } from "@/components/shared/status-badge";
import { getExecutionDisplayStatus } from "@/lib/execution-display";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Execution } from "@/types/domain";

interface ExecutionProcessingBreakdownProps {
  execution: Execution;
  batchSize?: number;
}

export function ExecutionProcessingBreakdown({ execution, batchSize }: ExecutionProcessingBreakdownProps) {
  const batchStatus = getExecutionDisplayStatus(execution);

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Processing breakdown</h3>
        <p className="text-sm text-muted-foreground mt-1">
          One execution equals one incoming batch. Records are split into chunks for processing.
        </p>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Batch (this process)</p>
            <p className="text-xl font-semibold mt-1 tabular-nums">{formatNumber(execution.recordsProcessed)} records</p>
          </div>
          <StatusBadge status={batchStatus} />
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className={cn("grid gap-4", batchSize != null ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2")}>
          {batchSize != null && <Stat label="Batch Size" value={batchSize} />}
          <Stat label="Total Records" value={execution.recordsProcessed} />
          <Stat label="Total Chunks" value={execution.chunkCount} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Completed Chunks" value={execution.chunksCompleted} />
          <Stat label="Failed Chunks" value={execution.chunksFailed} highlight={execution.chunksFailed > 0} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold mt-1 tabular-nums ${highlight ? "text-destructive" : ""}`}>
        {formatNumber(value)}
      </p>
    </div>
  );
}
