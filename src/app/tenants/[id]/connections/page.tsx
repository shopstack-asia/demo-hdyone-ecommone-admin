import { ConnectionsTab } from "@/components/connections/connections-tab";
import { connectionService, providerService } from "@/services";

interface ConnectionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantConnectionsPage({ params }: ConnectionsPageProps) {
  const { id } = await params;
  const [{ data: connections }, { data: providers }] = await Promise.all([
    connectionService.listConnections({ tenantId: id, pageSize: 100 }),
    providerService.listProviders({ pageSize: 100 }),
  ]);

  return <ConnectionsTab tenantId={id} connections={connections} providers={providers} />;
}
