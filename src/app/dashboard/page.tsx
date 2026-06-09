import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatCard } from "@/components/shared/stat-card";
import {
  RecentExecutionsTable,
  RecentDlqTable,
  RecentAuditTable,
} from "@/components/dashboard/recent-tables";
import {
  ExecutionTrendChart,
  FailureTrendChart,
  DlqTrendChart,
  ProviderUsageChart,
  StatusDistributionChart,
} from "@/components/dashboard/dashboard-charts";
import { formatNumber } from "@/lib/format";
import {
  dashboardService,
  executionService,
  dlqService,
  auditLogService,
  integrationService,
} from "@/services";
import {
  Activity,
  AlertTriangle,
  Building2,
  Cable,
  GitBranch,
  Layers,
  Server,
  ShieldAlert,
  XCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const [metrics, executionTrend, failureTrend, dlqTrend, providerUsage, statusDistribution, recentExecutions, recentDlq, recentAudit] =
    await Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getExecutionTrend(),
      dashboardService.getFailureTrend(),
      dashboardService.getDlqTrend(),
      dashboardService.getProviderUsage(),
      dashboardService.getStatusDistribution(),
      executionService.getRecent(8),
      dlqService.listRecords({ page: 1, pageSize: 8 }),
      auditLogService.list({ page: 1, pageSize: 8 }),
    ]);

  const integrationIds = [...new Set(recentExecutions.data.map((e) => e.integrationId))];
  const integrations = await Promise.all(
    integrationIds.map((id) => integrationService.getIntegration(id))
  );
  const integrationMap = Object.fromEntries(
    integrations.filter(Boolean).map((i) => [i!.id, i!.name])
  );

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="System-wide integration platform overview"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Tenants" value={formatNumber(metrics.totalTenants)} icon={Building2} />
        <StatCard title="Active Tenants" value={formatNumber(metrics.activeTenants)} icon={Building2} />
        <StatCard title="Providers" value={formatNumber(metrics.totalProviders)} icon={Layers} />
        <StatCard title="Connections" value={formatNumber(metrics.totalConnections)} icon={Cable} />
        <StatCard title="Integrations" value={formatNumber(metrics.totalIntegrations)} icon={GitBranch} />
        <StatCard title="Running Executions" value={formatNumber(metrics.runningExecutions)} icon={Activity} />
        <StatCard title="Failed Executions" value={formatNumber(metrics.failedExecutions)} icon={XCircle} />
        <StatCard title="DLQ Records" value={formatNumber(metrics.dlqRecords)} icon={AlertTriangle} />
        <StatCard title="Open Circuit Breakers" value={formatNumber(metrics.openCircuitBreakers)} icon={ShieldAlert} />
        <StatCard title="Active Workers" value={formatNumber(metrics.workerCount)} icon={Server} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ExecutionTrendChart data={executionTrend} />
        <StatusDistributionChart data={statusDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <FailureTrendChart data={failureTrend} />
        <DlqTrendChart data={dlqTrend} />
        <ProviderUsageChart data={providerUsage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section aria-labelledby="recent-executions-heading" className="lg:col-span-1 min-w-0">
          <SectionHeading id="recent-executions-heading">Recent executions</SectionHeading>
          <RecentExecutionsTable executions={recentExecutions.data} integrationMap={integrationMap} />
        </section>
        <section aria-labelledby="recent-dlq-heading" className="lg:col-span-1 min-w-0">
          <SectionHeading id="recent-dlq-heading">Recent DLQ records</SectionHeading>
          <RecentDlqTable records={recentDlq.data} />
        </section>
        <section aria-labelledby="recent-audit-heading" className="lg:col-span-1 min-w-0">
          <SectionHeading id="recent-audit-heading">Recent audit logs</SectionHeading>
          <RecentAuditTable logs={recentAudit.data} />
        </section>
      </div>
    </AppShell>
  );
}
