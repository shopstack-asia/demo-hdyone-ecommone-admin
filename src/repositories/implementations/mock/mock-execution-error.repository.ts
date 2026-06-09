import { getMockDatabase } from "@/data/mock-database";
import type { ExecutionErrorRepository } from "@/repositories/interfaces/execution-error.repository";

export class MockExecutionErrorRepository implements ExecutionErrorRepository {
  private get db() {
    return getMockDatabase();
  }

  async findByExecutionId(executionId: string) {
    return this.db.errorRecords
      .filter((record) => record.executionId === executionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string) {
    return this.db.errorRecords.find((record) => record.id === id) ?? null;
  }
}

export const mockExecutionErrorRepository = new MockExecutionErrorRepository();
