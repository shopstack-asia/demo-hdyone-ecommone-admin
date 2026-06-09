import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IntegrationsTable } from "@/components/integrations/integrations-table";
import { IntegrationsEmptyState } from "@/components/integrations/integrations-empty-state";
import { connectionService, integrationService } from "@/services";
import { Plus } from "lucide-react";

interface IntegrationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantIntegrationsPage({ params }: IntegrationsPageProps) {
  const { id } = await params;
  const [{ data: integrations }, connections] = await Promise.all([
    integrationService.listIntegrations({ tenantId: id, pageSize: 100 }),
    connectionService.getConnectionsByTenant(id),
  ]);
  const connMap = Object.fromEntries(connections.map((c) => [c.id, c.name]));
  const hasConnections = connections.length > 0;

  return (
    <div>
      <div className="flex justify-end mb-4">
        {hasConnections ? (
          <Link href={`/tenants/${id}/integrations/new`}>
            <Button className="min-h-11">
              <Plus className="h-4 w-4 mr-1" />
              Create integration
            </Button>
          </Link>
        ) : (
          <Button disabled title="Add connections before creating an integration" className="min-h-11">
            <Plus className="h-4 w-4 mr-1" />
            Create integration
          </Button>
        )}
      </div>

      {integrations.length === 0 ? (
        <IntegrationsEmptyState tenantId={id} hasConnections={hasConnections} />
      ) : (
        <IntegrationsTable tenantId={id} integrations={integrations} connMap={connMap} />
      )}
    </div>
  );
}
