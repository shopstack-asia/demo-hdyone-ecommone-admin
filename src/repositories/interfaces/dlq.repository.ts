import type { DlqRecord } from "@/types/domain";
import type { DlqFilter, PaginatedResult } from "@/types/query";

export interface DlqRepository {
  findAll(filter?: DlqFilter): Promise<PaginatedResult<DlqRecord>>;
  findById(id: string): Promise<DlqRecord | null>;
  findByTenantId(tenantId: string): Promise<DlqRecord[]>;
  findByExecutionId(executionId: string): Promise<DlqRecord[]>;
  countOpen(): Promise<number>;
}
