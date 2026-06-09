import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { TenantsTable } from "@/components/tenants/tenants-table";
import { tenantService } from "@/services";

export default async function TenantsPage() {
  const { data: tenants } = await tenantService.listTenants({ pageSize: 100 });

  const statsEntries = await Promise.all(
    tenants.map(async (t) => {
      const stats = await tenantService.getTenantStats(t.id);
      return [t.id, {
        connections: stats.connectionsCount,
        integrations: stats.integrationsCount,
        failures: stats.failedExecutionsCount,
        dlq: stats.dlqCount,
      }] as const;
    })
  );
  const statsMap = Object.fromEntries(statsEntries);

  return (
    <AppShell>
      <PageHeader
        title="Tenants"
        description="Manage multi-tenant integration clients"
      />
      <TenantsTable tenants={tenants} statsMap={statsMap} />
    </AppShell>
  );
}
