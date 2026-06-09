import type { Tenant, TenantStats } from "@/types/domain";
import type { TenantFilter } from "@/types/query";
import type { PaginatedResult } from "@/types/query";

export interface TenantRepository {
  findAll(filter?: TenantFilter): Promise<PaginatedResult<Tenant>>;
  findById(id: string): Promise<Tenant | null>;
  findByCode(code: string): Promise<Tenant | null>;
  getStats(tenantId: string): Promise<TenantStats>;
  create(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant>;
  update(id: string, data: Partial<Tenant>): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
}
