import type { ExecutionErrorRecord } from "@/types/domain";

export interface ExecutionErrorRepository {
  findByExecutionId(executionId: string): Promise<ExecutionErrorRecord[]>;
  findById(id: string): Promise<ExecutionErrorRecord | null>;
}
