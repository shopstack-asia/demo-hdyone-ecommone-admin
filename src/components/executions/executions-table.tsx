"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Execution } from "@/types/domain";

interface ExecutionsTableProps {
  executions: Execution[];
  integrationMap: Record<string, string>;
}

export function ExecutionsTable({ executions, integrationMap }: ExecutionsTableProps) {
  return (
    <DataTable
      caption="Executions"
      getRowId={(r) => r.id}
      rowHref={(r) => `/executions/${r.id}`}
      columns={[
        { key: "id", header: "Execution ID", cell: (r) => (
          <span className="font-mono text-xs text-primary">{r.id}</span>
        )},
        { key: "integration", header: "Integration", cell: (r) => (
          <span className="text-xs">{integrationMap[r.integrationId] ?? "—"}</span>
        )},
        { key: "trigger", header: "Trigger", hideOnMobile: true, cell: (r) => <StatusBadge status={r.triggerType} /> },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { key: "started", header: "Started", cell: (r) => (
          <span className="text-xs">{formatDate(r.startedAt)}</span>
        )},
        { key: "finished", header: "Finished", hideOnMobile: true, cell: (r) => (
          <span className="text-xs">{formatDate(r.finishedAt)}</span>
        )},
        { key: "duration", header: "Duration", cell: (r) => (
          <span className="text-xs">{formatDuration(r.durationMs)}</span>
        )},
        { key: "retry", header: "Retry Count", hideOnMobile: true, cell: (r) => r.retryCount },
        { key: "actions", header: "Actions", cell: (r) => (
          <Link
            href={`/executions/${r.id}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}
          >
            View
          </Link>
        )},
      ]}
      data={executions}
    />
  );
}
