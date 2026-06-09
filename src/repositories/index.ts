import { mockAuditLogRepository } from "./implementations/mock/mock-audit-log.repository";
import { mockCircuitBreakerRepository } from "./implementations/mock/mock-circuit-breaker.repository";
import { mockConnectionRepository } from "./implementations/mock/mock-connection.repository";
import { mockDlqRepository } from "./implementations/mock/mock-dlq.repository";
import { mockExecutionErrorRepository } from "./implementations/mock/mock-execution-error.repository";
import { mockExecutionRepository } from "./implementations/mock/mock-execution.repository";
import { mockIntegrationRepository } from "./implementations/mock/mock-integration.repository";
import { mockPlatformUserRepository } from "./implementations/mock/mock-platform-user.repository";
import { mockProviderRepository } from "./implementations/mock/mock-provider.repository";
import { mockRetryRepository } from "./implementations/mock/mock-retry.repository";
import {
  mockDashboardRepository,
  mockSystemConfigRepository,
} from "./implementations/mock/mock-system-config.repository";
import { mockTenantRepository } from "./implementations/mock/mock-tenant.repository";

export const repositories = {
  tenant: mockTenantRepository,
  provider: mockProviderRepository,
  connection: mockConnectionRepository,
  integration: mockIntegrationRepository,
  execution: mockExecutionRepository,
  executionError: mockExecutionErrorRepository,
  dlq: mockDlqRepository,
  retry: mockRetryRepository,
  circuitBreaker: mockCircuitBreakerRepository,
  auditLog: mockAuditLogRepository,
  systemConfig: mockSystemConfigRepository,
  platformUser: mockPlatformUserRepository,
  dashboard: mockDashboardRepository,
} as const;

export type Repositories = typeof repositories;
