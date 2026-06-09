import { getMockDatabase } from "@/data/mock-database";
import type { ExecutionRepository } from "@/repositories/interfaces/execution.repository";
import { paginate } from "@/repositories/utils/pagination";
import type { ExecutionFilter } from "@/types/query";

export class MockExecutionRepository implements ExecutionRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: ExecutionFilter = {}) {
    let items = [...this.db.executions];
    if (filter.tenantId) items = items.filter((e) => e.tenantId === filter.tenantId);
    if (filter.integrationId) items = items.filter((e) => e.integrationId === filter.integrationId);
    if (filter.status) items = items.filter((e) => e.status === filter.status);
    if (filter.triggerType) items = items.filter((e) => e.triggerType === filter.triggerType);
    items.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    return paginate(items, filter);
  }

  async findById(id: string) {
    return this.db.executions.find((e) => e.id === id) ?? null;
  }

  async findByTenantId(tenantId: string, limit = 10) {
    return this.db.executions
      .filter((e) => e.tenantId === tenantId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async findByIntegrationId(integrationId: string) {
    return this.db.executions.filter((e) => e.integrationId === integrationId);
  }

  async countByStatus(status: string) {
    return this.db.executions.filter((e) => e.status === status).length;
  }
}

export const mockExecutionRepository = new MockExecutionRepository();
