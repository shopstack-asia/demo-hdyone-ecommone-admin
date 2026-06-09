import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Execution } from "@/types/domain";
import { ArrowRight } from "lucide-react";

interface ExecutionErrorSummaryProps {
  execution: Execution;
  onViewDetails?: () => void;
}

export function ExecutionErrorSummary({ execution, onViewDetails }: ExecutionErrorSummaryProps) {
  const summary = execution.errorSummary;

  if (!summary || summary.errorCount === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-8 text-center text-sm text-muted-foreground">
        No errors recorded for this execution.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive-subtle/10 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-destructive-subtle-foreground">Error summary</h3>
        {onViewDetails && (
          <Button type="button" variant="outline" size="sm" className="min-h-9" onClick={onViewDetails}>
            View error details
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Metric label="Error count" value={formatNumber(summary.errorCount)} />
        <Metric label="Top error" value={summary.topError ?? "—"} mono />
        <Metric label="Affected records" value={formatNumber(summary.affectedRecords)} />
        <Metric label="Failure stage" value={summary.failureStageId ?? "—"} mono />
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Error distribution</p>
        <div className="space-y-2">
          {summary.distribution.map((item) => (
            <div key={item.errorCode} className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2 text-sm">
              <span className="font-mono">{item.errorCode}</span>
              <span className="font-medium tabular-nums">{formatNumber(item.count)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
