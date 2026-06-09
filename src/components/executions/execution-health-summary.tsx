import { getSuccessRate } from "@/lib/execution-display";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Execution } from "@/types/domain";
import { Clock, Gauge, Timer, Zap } from "lucide-react";

interface ExecutionHealthSummaryProps {
  execution: Execution;
}

export function ExecutionHealthSummary({ execution }: ExecutionHealthSummaryProps) {
  const successRate = getSuccessRate(execution);
  const items = [
    { label: "Success Rate", value: `${successRate.toFixed(1)}%`, icon: Gauge },
    { label: "Average Response Time", value: `${execution.averageResponseTimeMs} ms`, icon: Timer },
    { label: "Records Per Second", value: formatNumber(execution.recordsPerSecond), icon: Zap },
    { label: "Chunk Throughput", value: `${execution.chunkThroughput} chunks/sec`, icon: Clock },
    ...(execution.errorSummary?.topError
      ? [{ label: "Last Error", value: execution.errorSummary.topError, icon: Gauge }]
      : []),
  ];

  return (
    <div
      className={cn(
        "grid gap-4",
        items.length >= 5 ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mt-2 tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
