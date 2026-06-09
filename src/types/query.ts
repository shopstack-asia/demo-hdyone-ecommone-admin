export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TenantFilter extends PaginationParams, SortParams {
  search?: string;
  status?: string;
  country?: string;
}

export interface ConnectionFilter extends PaginationParams, SortParams {
  tenantId: string;
  search?: string;
  status?: string;
  providerId?: string;
}

export interface IntegrationFilter extends PaginationParams, SortParams {
  tenantId: string;
  search?: string;
  status?: string;
  triggerType?: string;
}

export interface ExecutionFilter extends PaginationParams, SortParams {
  tenantId?: string;
  integrationId?: string;
  status?: string;
  triggerType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DlqFilter extends PaginationParams, SortParams {
  tenantId?: string;
  integrationId?: string;
  executionId?: string;
  status?: string;
  stage?: string;
}

export interface RetryFilter extends PaginationParams, SortParams {
  tenantId?: string;
  executionId?: string;
  status?: string;
}

export interface CircuitBreakerFilter extends PaginationParams, SortParams {
  tenantId?: string;
  state?: string;
}

export interface AuditLogFilter extends PaginationParams, SortParams {
  tenantId?: string;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PlatformUserFilter extends PaginationParams, SortParams {
  search?: string;
  status?: string;
  role?: string;
}
