import { ExecutionsTable } from "@/components/executions/executions-table";
import { executionService, integrationService } from "@/services";

interface ExecutionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantExecutionsPage({ params }: ExecutionsPageProps) {
  const { id } = await params;
  const { data: executions } = await executionService.listExecutions({ tenantId: id, page: 1, pageSize: 50 });

  const integrations = await Promise.all(
    [...new Set(executions.map((e) => e.integrationId))].map((iid) => integrationService.getIntegration(iid))
  );
  const integrationMap = Object.fromEntries(integrations.filter(Boolean).map((i) => [i!.id, i!.name]));

  return <ExecutionsTable executions={executions} integrationMap={integrationMap} />;
}
