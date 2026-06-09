import { repositories } from "@/repositories";
import type { DlqFilter, RetryFilter, CircuitBreakerFilter, AuditLogFilter } from "@/types/query";

export class DlqService {
  async listRecords(filter?: DlqFilter) {
    return repositories.dlq.findAll(filter);
  }

  async getRecord(id: string) {
    return repositories.dlq.findById(id);
  }

  async getByExecution(executionId: string) {
    return repositories.dlq.findByExecutionId(executionId);
  }
}

export class ExecutionErrorService {
  async getByExecution(executionId: string) {
    return repositories.executionError.findByExecutionId(executionId);
  }

  async getRecord(id: string) {
    return repositories.executionError.findById(id);
  }
}

export class RetryService {
  async listRecords(filter?: RetryFilter) {
    return repositories.retry.findAll(filter);
  }

  async getByExecution(executionId: string) {
    return repositories.retry.findByExecutionId(executionId);
  }
}

export class CircuitBreakerService {
  async list(filter?: CircuitBreakerFilter) {
    return repositories.circuitBreaker.findAll(filter);
  }
}

export class AuditLogService {
  async list(filter?: AuditLogFilter) {
    return repositories.auditLog.findAll(filter);
  }

  async getRecentByTenant(tenantId: string, limit = 10) {
    return repositories.auditLog.findByTenantId(tenantId, limit);
  }
}

export const dlqService = new DlqService();
export const executionErrorService = new ExecutionErrorService();
export const retryService = new RetryService();
export const circuitBreakerService = new CircuitBreakerService();
export const auditLogService = new AuditLogService();
