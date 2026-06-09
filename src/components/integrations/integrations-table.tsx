"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Integration } from "@/types/domain";

interface IntegrationsTableProps {
  tenantId: string;
  integrations: Integration[];
  connMap: Record<string, string>;
}

export function IntegrationsTable({ tenantId, integrations, connMap }: IntegrationsTableProps) {
  return (
    <DataTable
      caption="Integrations"
      getRowId={(r) => r.id}
      rowHref={(r) => `/tenants/${tenantId}/integrations/${r.id}/edit`}
      columns={[
        { key: "code", header: "Code", cell: (r) => (
          <span className="font-mono text-sm text-primary">{r.code}</span>
        )},
        { key: "name", header: "Name", cell: (r) => r.name },
        { key: "source", header: "Source", cell: (r) => (
          <span className="text-xs">{connMap[r.sourceConnectionId] ?? "—"}</span>
        )},
        { key: "destination", header: "Destination", hideOnMobile: true, cell: (r) => (
          <span className="text-xs">{connMap[r.destinationConnectionId] ?? "—"}</span>
        )},
        { key: "trigger", header: "Trigger", cell: (r) => <StatusBadge status={r.triggerType} /> },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { key: "lastRun", header: "Last Run", hideOnMobile: true, cell: (r) => (
          <span className="text-xs">{formatDate(r.lastRunAt)}</span>
        )},
        { key: "successRate", header: "Success Rate", cell: (r) => (
          <span className="text-xs">{formatPercent(r.successRate)}</span>
        )},
        { key: "actions", header: "Actions", cell: (r) => (
          <Link
            href={`/tenants/${tenantId}/integrations/${r.id}/edit`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}
          >
            Edit
          </Link>
        )},
      ]}
      data={integrations}
    />
  );
}
