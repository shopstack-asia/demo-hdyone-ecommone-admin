import { repositories } from "@/repositories";
import type { ExecutionFilter } from "@/types/query";

export class ExecutionService {
  async listExecutions(filter?: ExecutionFilter) {
    return repositories.execution.findAll(filter);
  }

  async getExecution(id: string) {
    return repositories.execution.findById(id);
  }

  async getRecentByTenant(tenantId: string, limit = 10) {
    return repositories.execution.findByTenantId(tenantId, limit);
  }

  async getRecent(limit = 10) {
    return repositories.execution.findAll({ page: 1, pageSize: limit });
  }
}

export const executionService = new ExecutionService();
