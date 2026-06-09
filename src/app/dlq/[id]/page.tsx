import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DlqDetailView } from "@/components/observability/dlq-detail-view";
import {
  dlqService,
  executionService,
  integrationService,
  tenantService,
  retryService,
  auditLogService,
} from "@/services";
import { safeReturnPath } from "@/lib/navigation";

interface DlqDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function DlqDetailPage({ params, searchParams }: DlqDetailPageProps) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const record = await dlqService.getRecord(id);
  if (!record) notFound();

  const [execution, integration, tenant, retryRecords, auditLogsResult] = await Promise.all([
    executionService.getExecution(record.executionId),
    integrationService.getIntegration(record.integrationId),
    tenantService.getTenant(record.tenantId),
    retryService.getByExecution(record.executionId),
    auditLogService.list({ tenantId: record.tenantId, pageSize: 20 }),
  ]);

  const defaultBackHref = tenant ? `/tenants/${tenant.id}/dlq` : "/dashboard";
  const backHref = safeReturnPath(returnTo, defaultBackHref);

  return (
    <AppShell>
      <DlqDetailView
        record={record}
        execution={execution}
        integration={integration}
        tenant={tenant}
        retryRecords={retryRecords}
        auditLogs={auditLogsResult.data}
        backHref={backHref}
      />
    </AppShell>
  );
}
