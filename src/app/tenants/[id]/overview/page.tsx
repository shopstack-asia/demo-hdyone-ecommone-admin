import { StatCard } from "@/components/shared/stat-card";
import { TenantOverviewTables } from "@/components/tenants/tenant-overview-tables";
import { formatPercent } from "@/lib/format";
import {
  tenantService,
  executionService,
  dlqService,
  integrationService,
} from "@/services";
import { Activity, AlertTriangle, Cable, GitBranch, ShieldAlert, TrendingUp } from "lucide-react";

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantOverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;
  const [stats, recentExecutions, recentDlq] = await Promise.all([
    tenantService.getTenantStats(id),
    executionService.getRecentByTenant(id, 8),
    dlqService.listRecords({ tenantId: id, page: 1, pageSize: 5 }),
  ]);

  const integrations = await Promise.all(
    [...new Set(recentExecutions.map((e) => e.integrationId))].map((iid) =>
      integrationService.getIntegration(iid)
    )
  );
  const integrationMap = Object.fromEntries(integrations.filter(Boolean).map((i) => [i!.id, i!.name]));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Connections" value={stats.connectionsCount} icon={Cable} />
        <StatCard title="Integrations" value={stats.integrationsCount} icon={GitBranch} />
        <StatCard title="Success Rate" value={formatPercent(stats.successRate)} icon={TrendingUp} />
        <StatCard title="Failed Executions" value={stats.failedExecutionsCount} icon={Activity} />
        <StatCard title="DLQ" value={stats.dlqCount} icon={AlertTriangle} />
        <StatCard title="Circuit Breakers" value={stats.circuitBreakersOpen} icon={ShieldAlert} />
      </div>

      <TenantOverviewTables
        executions={recentExecutions}
        dlqRecords={recentDlq.data}
        integrationMap={integrationMap}
      />
    </div>
  );
}
