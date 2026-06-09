import { getMockDatabase } from "@/data/mock-database";
import type { DashboardRepository, SystemConfigRepository } from "@/repositories/interfaces/system-config.repository";
import { CircuitBreakerState, DlqStatus, ExecutionStatus, TenantStatus } from "@/types/enums";
import type {
  DashboardMetrics,
  ProviderUsageDataPoint,
  StatusDistributionDataPoint,
  TrendDataPoint,
} from "@/types/domain";
import { format, subDays } from "date-fns";

export class MockSystemConfigRepository implements SystemConfigRepository {
  private get db() {
    return getMockDatabase();
  }

  async getValidationProfiles() { return this.db.validationProfiles; }
  async getValidationProfileById(id: string) { return this.db.validationProfiles.find((p) => p.id === id) ?? null; }
  async getMappingProfiles() { return this.db.mappingProfiles; }
  async getMappingProfileById(id: string) { return this.db.mappingProfiles.find((p) => p.id === id) ?? null; }
  async getTransformationProfiles() { return this.db.transformationProfiles; }
  async getTransformationProfileById(id: string) { return this.db.transformationProfiles.find((p) => p.id === id) ?? null; }
  async getRoutingProfiles() { return this.db.routingProfiles; }
  async getRoutingProfileById(id: string) { return this.db.routingProfiles.find((p) => p.id === id) ?? null; }
  async getExecutionPolicies() { return this.db.executionPolicies; }
  async getExecutionPolicyById(id: string) { return this.db.executionPolicies.find((p) => p.id === id) ?? null; }
  async getRetryPolicies() { return this.db.retryPolicies; }
  async getRetryPolicyById(id: string) { return this.db.retryPolicies.find((p) => p.id === id) ?? null; }
  async getRetentionPolicies() { return this.db.retentionPolicies; }
  async getPlatformSettings() { return this.db.platformSettings; }
}

export class MockDashboardRepository implements DashboardRepository {
  private get db() {
    return getMockDatabase();
  }

  async getMetrics(): Promise<DashboardMetrics> {
    return {
      totalTenants: this.db.tenants.length,
      activeTenants: this.db.tenants.filter((t) => t.status === TenantStatus.ACTIVE).length,
      totalProviders: this.db.providers.length,
      totalConnections: this.db.connections.length,
      totalIntegrations: this.db.integrations.length,
      runningExecutions: this.db.executions.filter((e) =>
        [ExecutionStatus.RUNNING, ExecutionStatus.VALIDATING, ExecutionStatus.MAPPING,
         ExecutionStatus.TRANSFORMING, ExecutionStatus.ROUTING, ExecutionStatus.DELIVERING].includes(e.status)
      ).length,
      failedExecutions: this.db.executions.filter((e) => e.status === ExecutionStatus.FAILED).length,
      dlqRecords: this.db.dlqRecords.filter((d) => d.status === DlqStatus.OPEN).length,
      openCircuitBreakers: this.db.circuitBreakers.filter((c) => c.state === CircuitBreakerState.OPEN).length,
      workerCount: this.db.platformSettings.workerCount,
    };
  }

  async getExecutionTrend(days = 14): Promise<TrendDataPoint[]> {
    return this.generateTrend(days);
  }

  async getFailureTrend(days = 14): Promise<TrendDataPoint[]> {
    return this.generateTrend(days);
  }

  async getDlqTrend(days = 14): Promise<TrendDataPoint[]> {
    return this.generateTrend(days);
  }

  private generateTrend(days: number): TrendDataPoint[] {
    return Array.from({ length: days }, (_, i) => {
      const date = format(subDays(new Date(), days - 1 - i), "MMM dd");
      return {
        date,
        success: 200 + Math.floor(Math.random() * 300),
        failed: 5 + Math.floor(Math.random() * 30),
        retry: 10 + Math.floor(Math.random() * 20),
        dlq: 2 + Math.floor(Math.random() * 10),
      };
    });
  }

  async getProviderUsage(): Promise<ProviderUsageDataPoint[]> {
    const usage = new Map<string, number>();
    for (const conn of this.db.connections) {
      const provider = this.db.providers.find((p) => p.id === conn.providerId);
      if (provider) {
        usage.set(provider.name, (usage.get(provider.name) ?? 0) + 1);
      }
    }
    return Array.from(usage.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getStatusDistribution(): Promise<StatusDistributionDataPoint[]> {
    const counts = new Map<string, number>();
    for (const exec of this.db.executions) {
      counts.set(exec.status, (counts.get(exec.status) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .slice(0, 8)
      .map(([status, count]) => ({ status, count }));
  }
}

export const mockSystemConfigRepository = new MockSystemConfigRepository();
export const mockDashboardRepository = new MockDashboardRepository();
