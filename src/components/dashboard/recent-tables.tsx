"use client";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDuration } from "@/lib/format";
import type { AuditLog, DlqRecord, Execution } from "@/types/domain";

interface RecentExecutionsTableProps {
  executions: Execution[];
  integrationMap: Record<string, string>;
}

export function RecentExecutionsTable({ executions, integrationMap }: RecentExecutionsTableProps) {
  return (
    <DataTable
      caption="Recent executions"
      getRowId={(r) => r.id}
      rowHref={(r) => `/executions/${r.id}`}
      columns={[
        { key: "id", header: "ID", cell: (r) => (
          <span className="font-mono text-xs text-primary">{r.id.replace("EXE-", "")}</span>
        )},
        { key: "integration", header: "Integration", cell: (r) => (
          <span className="text-xs">{integrationMap[r.integrationId] ?? r.integrationId}</span>
        )},
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { key: "duration", header: "Duration", hideOnMobile: true, cell: (r) => (
          <span className="text-xs">{formatDuration(r.durationMs)}</span>
        )},
      ]}
      data={executions}
    />
  );
}

interface RecentDlqTableProps {
  records: DlqRecord[];
}

export function RecentDlqTable({ records }: RecentDlqTableProps) {
  return (
    <DataTable
      caption="Recent DLQ records"
      getRowId={(r) => r.id}
      rowHref={(r) => `/dlq/${r.id}`}
      columns={[
        { key: "id", header: "ID", cell: (r) => (
          <span className="font-mono text-xs">{r.id.replace("DLQ-", "")}</span>
        )},
        { key: "stage", header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
        { key: "error", header: "Error", cell: (r) => (
          <span className="text-xs">{r.errorCode}</span>
        )},
      ]}
      data={records}
    />
  );
}

interface RecentAuditTableProps {
  logs: AuditLog[];
}

export function RecentAuditTable({ logs }: RecentAuditTableProps) {
  return (
    <DataTable
      caption="Recent audit logs"
      getRowId={(r) => r.id}
      columns={[
        { key: "time", header: "Time", cell: (r) => (
          <span className="text-xs">{formatDate(r.createdAt)}</span>
        )},
        { key: "user", header: "User", cell: (r) => (
          <span className="text-xs">{r.userName}</span>
        )},
        { key: "action", header: "Action", cell: (r) => <StatusBadge status={r.action} /> },
        { key: "resource", header: "Resource", hideOnMobile: true, cell: (r) => (
          <span className="text-xs">{r.resource}</span>
        )},
      ]}
      data={logs}
    />
  );
}
