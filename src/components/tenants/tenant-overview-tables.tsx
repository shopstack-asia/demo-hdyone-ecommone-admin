"use client";

import { DataTable } from "@/components/shared/data-table";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDuration } from "@/lib/format";
import type { DlqRecord, Execution } from "@/types/domain";

interface TenantOverviewTablesProps {
  executions: Execution[];
  dlqRecords: DlqRecord[];
  integrationMap: Record<string, string>;
}

export function TenantOverviewTables({ executions, dlqRecords, integrationMap }: TenantOverviewTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
      <section aria-labelledby="tenant-recent-executions" className="min-w-0">
        <SectionHeading id="tenant-recent-executions">Recent executions</SectionHeading>
        <DataTable
          caption="Recent executions"
          getRowId={(r) => r.id}
          rowHref={(r) => `/executions/${r.id}`}
          columns={[
            { key: "id", header: "Execution", cell: (r) => (
              <span className="font-mono text-xs text-primary">{r.id}</span>
            )},
            { key: "integration", header: "Integration", cell: (r) => (
              <span className="text-xs">{integrationMap[r.integrationId] ?? "—"}</span>
            )},
            { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            { key: "started", header: "Started", hideOnMobile: true, cell: (r) => (
              <span className="text-xs">{formatDate(r.startedAt)}</span>
            )},
            { key: "duration", header: "Duration", cell: (r) => (
              <span className="text-xs">{formatDuration(r.durationMs)}</span>
            )},
          ]}
          data={executions}
        />
      </section>

      <section aria-labelledby="tenant-recent-dlq" className="min-w-0">
        <SectionHeading id="tenant-recent-dlq">Recent DLQ records</SectionHeading>
        <DataTable
            caption="Recent DLQ records"
            getRowId={(r) => r.id}
            rowHref={(r) => `/dlq/${r.id}`}
            columns={[
            { key: "id", header: "DLQ ID", cell: (r) => (
              <span className="font-mono text-xs">{r.id}</span>
            )},
            { key: "stage", header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
            { key: "error", header: "Error", cell: (r) => (
              <span className="text-xs">{r.errorCode}</span>
            )},
            { key: "created", header: "Created", hideOnMobile: true, cell: (r) => (
              <span className="text-xs">{formatDate(r.createdAt)}</span>
            )},
          ]}
          data={dlqRecords}
        />
      </section>
    </div>
  );
}
