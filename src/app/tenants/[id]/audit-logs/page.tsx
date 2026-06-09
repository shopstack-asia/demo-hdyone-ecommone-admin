import { AuditLogsTable } from "@/components/observability/observability-tables";
import { auditLogService } from "@/services";

interface AuditLogsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantAuditLogsPage({ params }: AuditLogsPageProps) {
  const { id } = await params;
  const { data: logs } = await auditLogService.list({ tenantId: id, page: 1, pageSize: 50 });
  return <AuditLogsTable logs={logs} />;
}
