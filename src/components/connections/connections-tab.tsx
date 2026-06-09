"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConnectionsEmptyState } from "@/components/connections/connections-empty-state";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Connection, Provider } from "@/types/domain";

interface ConnectionsTabProps {
  tenantId: string;
  connections: Connection[];
  providers: Provider[];
}

export function ConnectionsTab({ tenantId, connections, providers }: ConnectionsTabProps) {
  const providerMap = new Map(providers.map((p) => [p.id, p]));
  const createHref = `/tenants/${tenantId}/connections/new`;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Link href={createHref} className={cn(buttonVariants(), "min-h-11 inline-flex")}>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          Create connection
        </Link>
      </div>

      {connections.length === 0 ? (
        <ConnectionsEmptyState createHref={createHref} />
      ) : (
        <DataTable
          caption="Connections"
          getRowId={(r) => r.id}
          columns={[
            { key: "name", header: "Name", cell: (r) => r.name },
            { key: "provider", header: "Provider", cell: (r) => providerMap.get(r.providerId)?.name ?? "—" },
            { key: "category", header: "Category", hideOnMobile: true, cell: (r) => {
              const category = providerMap.get(r.providerId)?.category;
              return category ? (
                <span className="text-xs capitalize">{category.toLowerCase()}</span>
              ) : "—";
            }},
            { key: "active", header: "Active", cell: (r) => <StatusBadge status={r.activeStatus} /> },
            { key: "health", header: "Health", cell: (r) => <StatusBadge status={r.status} /> },
            { key: "lastTested", header: "Last tested", hideOnMobile: true, cell: (r) => (
              <span className="text-xs">{formatDate(r.lastTestedAt)}</span>
            )},
            { key: "lastUsed", header: "Last used", hideOnMobile: true, cell: (r) => (
              <span className="text-xs">{formatDate(r.lastUsedAt)}</span>
            )},
            { key: "created", header: "Created", hideOnMobile: true, cell: (r) => (
              <span className="text-xs">{formatDate(r.createdAt)}</span>
            )},
            { key: "actions", header: "Actions", cell: (r) => (
              <Link
                href={`/tenants/${tenantId}/connections/${r.id}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}
              >
                Edit
              </Link>
            )},
          ]}
          data={connections}
        />
      )}
    </>
  );
}
