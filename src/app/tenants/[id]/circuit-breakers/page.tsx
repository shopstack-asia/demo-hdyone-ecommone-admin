import { CircuitBreakersTable } from "@/components/observability/observability-tables";
import { circuitBreakerService, connectionService, providerService } from "@/services";

interface CircuitBreakersPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantCircuitBreakersPage({ params }: CircuitBreakersPageProps) {
  const { id } = await params;
  const { data: breakers } = await circuitBreakerService.list({ tenantId: id, pageSize: 50 });
  const connections = await connectionService.getConnectionsByTenant(id);
  const { data: providers } = await providerService.listProviders({ pageSize: 100 });

  const connMap = Object.fromEntries(connections.map((c) => [c.id, c.name]));
  const providerMap = Object.fromEntries(providers.map((p) => [p.id, p.name]));

  return <CircuitBreakersTable breakers={breakers} connMap={connMap} providerMap={providerMap} />;
}
