import type { AuditLog } from "@/types/domain";
import type { AuditLogFilter, PaginatedResult } from "@/types/query";

export interface AuditLogRepository {
  findAll(filter?: AuditLogFilter): Promise<PaginatedResult<AuditLog>>;
  findById(id: string): Promise<AuditLog | null>;
  findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]>;
}
