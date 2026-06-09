import type { RetryRecord } from "@/types/domain";
import type { PaginatedResult, RetryFilter } from "@/types/query";

export interface RetryRepository {
  findAll(filter?: RetryFilter): Promise<PaginatedResult<RetryRecord>>;
  findById(id: string): Promise<RetryRecord | null>;
  findByExecutionId(executionId: string): Promise<RetryRecord[]>;
}
