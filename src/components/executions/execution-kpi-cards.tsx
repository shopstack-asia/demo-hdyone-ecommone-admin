import { cn } from "@/lib/utils";
import { getExecutionDlqRecordCount } from "@/lib/execution-dlq";
import { formatNumber } from "@/lib/format";
import type { Execution } from "@/types/domain";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Network,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExecutionKpiCardsProps {
  execution: Execution;
}

type KpiItem = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
};

export function ExecutionKpiCards({ execution }: ExecutionKpiCardsProps) {
  const dlqRecordCount = getExecutionDlqRecordCount(execution);
  const items: KpiItem[] = [
    { title: "Records Processed", value: execution.recordsProcessed, icon: Activity },
    { title: "Records Success", value: execution.recordsSuccess, icon: CheckCircle2, tone: "success" },
    { title: "Records Failed", value: execution.recordsFailed, icon: XCircle, tone: execution.recordsFailed > 0 ? "destructive" : "default" },
    { title: "DLQ Records", value: dlqRecordCount, icon: AlertTriangle, tone: dlqRecordCount > 0 ? "warning" : "default" },
    { title: "Retry Count", value: execution.retryCount, icon: RefreshCw, tone: execution.retryCount > 0 ? "warning" : "default" },
    { title: "Chunk Count", value: execution.chunkCount, icon: Layers },
    { title: "API Calls", value: execution.apiCalls, icon: Network },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
      {items.map((item) => (
        <div
          key={item.title}
          className={cn(
            "rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm",
            item.tone === "success" && "border-success/20 bg-success-subtle/20",
            item.tone === "warning" && "border-warning/20 bg-warning-subtle/20",
            item.tone === "destructive" && "border-destructive/20 bg-destructive-subtle/20"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
            <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums mt-2">{formatNumber(item.value)}</p>
        </div>
      ))}
    </div>
  );
}
