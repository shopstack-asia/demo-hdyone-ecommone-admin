import { getMockDatabase } from "@/data/mock-database";
import type { TenantRepository } from "@/repositories/interfaces/tenant.repository";
import { paginate, searchFilter } from "@/repositories/utils/pagination";
import { ExecutionStatus, CircuitBreakerState } from "@/types/enums";
import type { Tenant, TenantStats } from "@/types/domain";
import type { TenantFilter } from "@/types/query";

export class MockTenantRepository implements TenantRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: TenantFilter = {}) {
    let items = [...this.db.tenants];
    items = searchFilter(items, filter.search, ["code", "name", "country"]);
    if (filter.status) items = items.filter((t) => t.status === filter.status);
    if (filter.country) items = items.filter((t) => t.country === filter.country);
    return paginate(items, filter, (a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return this.db.tenants.find((t) => t.id === id) ?? null;
  }

  async findByCode(code: string) {
    return this.db.tenants.find((t) => t.code === code) ?? null;
  }

  async getStats(tenantId: string): Promise<TenantStats> {
    const connections = this.db.connections.filter((c) => c.tenantId === tenantId);
    const integrations = this.db.integrations.filter((i) => i.tenantId === tenantId);
    const executions = this.db.executions.filter((e) => e.tenantId === tenantId);
    const failed = executions.filter((e) => e.status === ExecutionStatus.FAILED);
    const dlq = this.db.dlqRecords.filter((d) => d.tenantId === tenantId);
    const cbOpen = this.db.circuitBreakers.filter(
      (c) => c.tenantId === tenantId && c.state === CircuitBreakerState.OPEN
    );
    const completed = executions.filter((e) => e.status === ExecutionStatus.COMPLETED);
    const successRate = executions.length > 0 ? (completed.length / executions.length) * 100 : 100;

    return {
      tenantId,
      connectionsCount: connections.length,
      integrationsCount: integrations.length,
      failedExecutionsCount: failed.length,
      dlqCount: dlq.length,
      circuitBreakersOpen: cbOpen.length,
      successRate: Math.round(successRate * 10) / 10,
    };
  }

  async create(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const tenant: Tenant = {
      ...data,
      id: `TNT-${String(this.db.tenants.length + 1).padStart(6, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.tenants.push(tenant);
    return tenant;
  }

  async update(id: string, data: Partial<Tenant>) {
    const idx = this.db.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.db.tenants[idx] = { ...this.db.tenants[idx], ...data, updatedAt: new Date() };
    return this.db.tenants[idx];
  }

  async delete(id: string) {
    const idx = this.db.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.db.tenants.splice(idx, 1);
    return true;
  }
}

export const mockTenantRepository = new MockTenantRepository();
