"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types/domain";
import { Plus, Search } from "lucide-react";

interface TenantsTableProps {
  tenants: Tenant[];
  statsMap: Record<string, { connections: number; integrations: number; failures: number; dlq: number }>;
}

export function TenantsTable({ tenants, statsMap }: TenantsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tenants..."
            className="pl-9 min-h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tenants"
          />
        </div>
        <Link href="/tenants/new" className={cn(buttonVariants(), "min-h-11 shrink-0 inline-flex")}>
          <Plus className="h-4 w-4 mr-1" />
          Create tenant
        </Link>
      </div>

      <DataTable
        caption="Tenants"
        getRowId={(r) => r.id}
        rowHref={(r) => `/tenants/${r.id}`}
        columns={[
          { key: "code", header: "Tenant Code", cell: (r) => (
            <span className="font-mono text-sm text-primary">{r.code}</span>
          )},
          { key: "name", header: "Tenant Name", cell: (r) => r.name },
          { key: "country", header: "Country", cell: (r) => r.country },
          { key: "timezone", header: "Timezone", hideOnMobile: true, cell: (r) => (
            <span className="text-xs font-mono">{r.timezone}</span>
          )},
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { key: "connections", header: "Connections", hideOnMobile: true, cell: (r) => formatNumber(statsMap[r.id]?.connections ?? 0) },
          { key: "integrations", header: "Integrations", hideOnMobile: true, cell: (r) => formatNumber(statsMap[r.id]?.integrations ?? 0) },
          { key: "failures", header: "Failures", cell: (r) => formatNumber(statsMap[r.id]?.failures ?? 0) },
          { key: "dlq", header: "DLQ", cell: (r) => formatNumber(statsMap[r.id]?.dlq ?? 0) },
          { key: "created", header: "Created", hideOnMobile: true, cell: (r) => (
            <span className="text-xs">{formatDate(r.createdAt)}</span>
          )},
          { key: "actions", header: "Actions", cell: (r) => (
            <Link
              href={`/tenants/${r.id}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}
            >
              View
            </Link>
          )},
        ]}
        data={filtered}
        emptyMessage="No tenants match your search."
      />
    </>
  );
}
