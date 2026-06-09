import { getMockDatabase } from "@/data/mock-database";
import type { RetryRepository } from "@/repositories/interfaces/retry.repository";
import { paginate } from "@/repositories/utils/pagination";
import type { RetryFilter } from "@/types/query";

export class MockRetryRepository implements RetryRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: RetryFilter = {}) {
    let items = [...this.db.retryRecords];
    if (filter.tenantId) items = items.filter((r) => r.tenantId === filter.tenantId);
    if (filter.executionId) items = items.filter((r) => r.executionId === filter.executionId);
    if (filter.status) items = items.filter((r) => r.status === filter.status);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(items, filter);
  }

  async findById(id: string) {
    return this.db.retryRecords.find((r) => r.id === id) ?? null;
  }

  async findByExecutionId(executionId: string) {
    return this.db.retryRecords.filter((r) => r.executionId === executionId);
  }
}

export const mockRetryRepository = new MockRetryRepository();
