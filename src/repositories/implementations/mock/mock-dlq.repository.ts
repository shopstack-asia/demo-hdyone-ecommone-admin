import { getMockDatabase } from "@/data/mock-database";
import type { DlqRepository } from "@/repositories/interfaces/dlq.repository";
import { paginate } from "@/repositories/utils/pagination";
import { DlqStatus } from "@/types/enums";
import type { DlqFilter } from "@/types/query";

export class MockDlqRepository implements DlqRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: DlqFilter = {}) {
    let items = [...this.db.dlqRecords];
    if (filter.tenantId) items = items.filter((d) => d.tenantId === filter.tenantId);
    if (filter.integrationId) items = items.filter((d) => d.integrationId === filter.integrationId);
    if (filter.executionId) items = items.filter((d) => d.executionId === filter.executionId);
    if (filter.status) items = items.filter((d) => d.status === filter.status);
    if (filter.stage) items = items.filter((d) => d.stage === filter.stage);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(items, filter);
  }

  async findByExecutionId(executionId: string) {
    return this.db.dlqRecords
      .filter((d) => d.executionId === executionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string) {
    return this.db.dlqRecords.find((d) => d.id === id) ?? null;
  }

  async findByTenantId(tenantId: string) {
    return this.db.dlqRecords.filter((d) => d.tenantId === tenantId);
  }

  async countOpen() {
    return this.db.dlqRecords.filter((d) => d.status === DlqStatus.OPEN).length;
  }
}

export const mockDlqRepository = new MockDlqRepository();
