import type { CircuitBreaker } from "@/types/domain";
import type { CircuitBreakerFilter, PaginatedResult } from "@/types/query";

export interface CircuitBreakerRepository {
  findAll(filter?: CircuitBreakerFilter): Promise<PaginatedResult<CircuitBreaker>>;
  findById(id: string): Promise<CircuitBreaker | null>;
  findByTenantId(tenantId: string): Promise<CircuitBreaker[]>;
  countOpen(): Promise<number>;
}
