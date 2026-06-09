import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { getExecutionDlqRecordCount } from "@/lib/execution-dlq";
import { formatNumber } from "@/lib/format";
import type { Execution } from "@/types/domain";
import { RotateCcw } from "lucide-react";

interface ExecutionDlqSummaryProps {
  execution: Execution;
}

export function ExecutionDlqSummary({ execution }: ExecutionDlqSummaryProps) {
  const summary = execution.dlqSummary;
  const dlqRecordCount = getExecutionDlqRecordCount(execution);

  if (!summary || dlqRecordCount === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-8 text-center text-sm text-muted-foreground">
        No DLQ records for this execution.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning-subtle/10 p-5 space-y-4">
      <h3 className="font-semibold">DLQ summary</h3>
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">DLQ records</dt>
          <dd className="font-medium mt-1">{formatNumber(dlqRecordCount)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reason</dt>
          <dd className="font-medium mt-1">{summary.reason ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
          <dd className="mt-1">
            {summary.status ? <StatusBadge status={summary.status} /> : "—"}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="min-h-9">
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Retry failed records
        </Button>
        <Button type="button" variant="outline" size="sm" className="min-h-9">
          Move to retry queue
        </Button>
      </div>
    </div>
  );
}
