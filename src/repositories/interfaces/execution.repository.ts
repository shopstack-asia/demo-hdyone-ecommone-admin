import type { Execution } from "@/types/domain";
import type { ExecutionFilter, PaginatedResult } from "@/types/query";

export interface ExecutionRepository {
  findAll(filter?: ExecutionFilter): Promise<PaginatedResult<Execution>>;
  findById(id: string): Promise<Execution | null>;
  findByTenantId(tenantId: string, limit?: number): Promise<Execution[]>;
  findByIntegrationId(integrationId: string): Promise<Execution[]>;
  countByStatus(status: string): Promise<number>;
}
