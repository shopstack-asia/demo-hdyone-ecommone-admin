import type { Integration } from "@/types/domain";
import type { IntegrationFilter, PaginatedResult } from "@/types/query";

export interface IntegrationRepository {
  findAll(filter: IntegrationFilter): Promise<PaginatedResult<Integration>>;
  findById(id: string): Promise<Integration | null>;
  findByCode(code: string): Promise<Integration | null>;
  resolveForTenant(tenantId: string, key: string): Promise<Integration | null>;
  resolveByKey(key: string): Promise<Integration | null>;
  findByTenantId(tenantId: string): Promise<Integration[]>;
  create(integration: Omit<Integration, "id" | "createdAt" | "updatedAt">): Promise<Integration>;
  update(id: string, data: Partial<Integration>): Promise<Integration | null>;
  delete(id: string): Promise<boolean>;
}
