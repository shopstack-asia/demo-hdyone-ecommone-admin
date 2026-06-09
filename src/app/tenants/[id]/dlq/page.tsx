import { DlqTable } from "@/components/observability/observability-tables";
import { dlqService, integrationService } from "@/services";

interface DlqPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDlqPage({ params }: DlqPageProps) {
  const { id } = await params;
  const { data: records } = await dlqService.listRecords({ tenantId: id, page: 1, pageSize: 50 });

  const integrations = await Promise.all(
    [...new Set(records.map((r) => r.integrationId))].map((iid) => integrationService.getIntegration(iid))
  );
  const integrationMap = Object.fromEntries(integrations.filter(Boolean).map((i) => [i!.id, i!.name]));

  return <DlqTable records={records} integrationMap={integrationMap} />;
}
