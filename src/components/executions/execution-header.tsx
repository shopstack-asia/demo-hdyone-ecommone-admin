import type { ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { getExecutionDisplayStatus } from "@/lib/execution-display";
import { formatDate, formatDuration } from "@/lib/format";
import type { Execution, Integration, Tenant } from "@/types/domain";
import { ExecutionActions } from "./execution-actions";

interface ExecutionHeaderProps {
  execution: Execution;
  integration: Integration | null;
  tenant: Tenant | null;
  integrationFlow: string;
  backHref: string;
}

export function ExecutionHeader({
  execution,
  integration,
  tenant,
  integrationFlow,
  backHref,
}: ExecutionHeaderProps) {
  const displayStatus = getExecutionDisplayStatus(execution);

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={backHref}
        title={execution.id}
        subtitle={
          <>
            {integration?.name ?? execution.integrationId}
            {tenant && (
              <>
                {" · "}
                <Link href={`/tenants/${tenant.id}`} className="text-link hover:text-link-hover hover:underline">
                  {tenant.name}
                </Link>
              </>
            )}
          </>
        }
        status={<StatusBadge status={displayStatus} />}
        actions={<ExecutionActions execution={execution} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-5 rounded-xl border border-border/60 bg-card/80 text-sm">
        <MetaItem label="Integration" value={integrationFlow} />
        <MetaItem label="Tenant" value={tenant?.name ?? execution.tenantId} />
        <MetaItem label="Environment" value={execution.environment} />
        <MetaItem label="Trigger" value={<StatusBadge status={execution.triggerType} />} />
        <MetaItem label="Started" value={formatDate(execution.startedAt)} />
        <MetaItem label="Finished" value={formatDate(execution.finishedAt)} />
        <MetaItem label="Duration" value={formatDuration(execution.durationMs)} />
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}
