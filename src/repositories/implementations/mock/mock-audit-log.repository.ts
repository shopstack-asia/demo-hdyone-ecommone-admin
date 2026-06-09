import { getMockDatabase } from "@/data/mock-database";
import type { AuditLogRepository } from "@/repositories/interfaces/audit-log.repository";
import { paginate } from "@/repositories/utils/pagination";
import type { AuditLogFilter } from "@/types/query";

export class MockAuditLogRepository implements AuditLogRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: AuditLogFilter = {}) {
    let items = [...this.db.auditLogs];
    if (filter.tenantId) items = items.filter((a) => a.tenantId === filter.tenantId);
    if (filter.action) items = items.filter((a) => a.action === filter.action);
    if (filter.userId) items = items.filter((a) => a.userId === filter.userId);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(items, filter);
  }

  async findById(id: string) {
    return this.db.auditLogs.find((a) => a.id === id) ?? null;
  }

  async findByTenantId(tenantId: string, limit = 10) {
    return this.db.auditLogs
      .filter((a) => a.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const mockAuditLogRepository = new MockAuditLogRepository();
