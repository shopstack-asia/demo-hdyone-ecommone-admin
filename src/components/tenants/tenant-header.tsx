"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Tenant } from "@/types/domain";

const TABS = [
  { href: "overview", label: "Overview" },
  { href: "connections", label: "Connections" },
  { href: "integrations", label: "Integrations" },
  { href: "executions", label: "Executions" },
  { href: "retry", label: "Retry" },
  { href: "dlq", label: "DLQ" },
  { href: "audit-logs", label: "Audit Logs" },
  { href: "settings", label: "Settings" },
];

interface TenantHeaderProps {
  tenant: Tenant;
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const pathname = usePathname();
  const basePath = `/tenants/${tenant.id}`;
  const currentTab = pathname.split("/").pop() ?? "overview";

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{tenant.name}</h1>
            <StatusBadge status={tenant.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">{tenant.code}</span>
            {" · "}{tenant.country}
            {" · "}{tenant.timezone}
          </p>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-border/60 overflow-x-auto">
        {TABS.map(({ href, label }) => (
          <Link
            key={href}
            href={`${basePath}/${href}`}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap min-h-11 inline-flex items-center",
              currentTab === href
                ? "border-primary text-primary-subtle-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            aria-current={currentTab === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
