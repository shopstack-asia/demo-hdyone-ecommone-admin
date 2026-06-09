"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DlqRecord, RetryRecord, CircuitBreaker, AuditLog } from "@/types/domain";

export function DlqTable({ records, integrationMap }: { records: DlqRecord[]; integrationMap: Record<string, string> }) {
  return (
    <DataTable
      caption="Dead letter queue"
      getRowId={(r) => r.id}
      rowHref={(r) => `/dlq/${r.id}`}
      columns={[
        { key: "id", header: "DLQ ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { key: "execution", header: "Execution", hideOnMobile: true, cell: (r) => <span className="font-mono text-xs">{r.executionId}</span> },
        { key: "integration", header: "Integration", cell: (r) => <span className="text-xs">{integrationMap[r.integrationId] ?? "—"}</span> },
        { key: "stage", header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
        { key: "errorCode", header: "Error Code", cell: (r) => <span className="font-mono text-xs">{r.errorCode}</span> },
        { key: "errorMessage", header: "Error Message", hideOnMobile: true, cell: (r) => <span className="text-xs">{r.errorMessage}</span> },
        { key: "created", header: "Created At", hideOnMobile: true, cell: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        {
          key: "actions",
          header: "Actions",
          cell: (r) => (
            <Link href={`/dlq/${r.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}>
              View
            </Link>
          ),
        },
      ]}
      data={records}
    />
  );
}

export function RetryTable({ records }: { records: RetryRecord[] }) {
  return (
    <DataTable
      caption="Retry queue"
      getRowId={(r) => r.id}
      columns={[
        { key: "id", header: "Retry ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { key: "execution", header: "Execution", cell: (r) => <span className="font-mono text-xs">{r.executionId}</span> },
        { key: "attempt", header: "Attempt", cell: (r) => r.attempt },
        { key: "strategy", header: "Strategy", hideOnMobile: true, cell: (r) => <StatusBadge status={r.strategy} /> },
        { key: "nextRetry", header: "Next Retry", cell: (r) => <span className="text-xs">{formatDate(r.nextRetryAt)}</span> },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { key: "actions", header: "Actions", cell: () => <Button variant="ghost" size="sm" className="min-h-10">Cancel</Button> },
      ]}
      data={records}
    />
  );
}

export function CircuitBreakersTable({
  breakers,
  connMap,
  providerMap,
}: {
  breakers: CircuitBreaker[];
  connMap: Record<string, string>;
  providerMap: Record<string, string>;
}) {
  return (
    <DataTable
      caption="Circuit breakers"
      getRowId={(r) => r.id}
      columns={[
        { key: "provider", header: "Provider", cell: (r) => providerMap[r.providerId] ?? "—" },
        { key: "connection", header: "Connection", cell: (r) => connMap[r.connectionId] ?? "—" },
        { key: "state", header: "State", cell: (r) => <StatusBadge status={r.state} /> },
        { key: "failures", header: "Failure Count", hideOnMobile: true, cell: (r) => r.failureCount },
        { key: "lastFailure", header: "Last Failure", hideOnMobile: true, cell: (r) => <span className="text-xs">{formatDate(r.lastFailureAt)}</span> },
        { key: "nextProbe", header: "Next Probe", cell: (r) => <span className="text-xs">{formatDate(r.nextProbeAt)}</span> },
        { key: "actions", header: "Actions", cell: () => <Button variant="ghost" size="sm" className="min-h-10">Reset</Button> },
      ]}
      data={breakers}
    />
  );
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  return (
    <DataTable
      caption="Audit logs"
      getRowId={(r) => r.id}
      columns={[
        { key: "timestamp", header: "Timestamp", cell: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        { key: "user", header: "User", cell: (r) => r.userName },
        { key: "action", header: "Action", cell: (r) => <StatusBadge status={r.action} /> },
        { key: "resource", header: "Resource", hideOnMobile: true, cell: (r) => r.resource },
        { key: "result", header: "Result", cell: (r) => <StatusBadge status={r.result} /> },
        { key: "details", header: "Details", hideOnMobile: true, cell: (r) => <span className="text-xs">{r.details}</span> },
      ]}
      data={logs}
    />
  );
}
