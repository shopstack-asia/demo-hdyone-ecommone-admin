export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}

export enum ProviderCapability {
  SOURCE = "SOURCE",
  DESTINATION = "DESTINATION",
}

export enum ConnectionStatus {
  HEALTHY = "HEALTHY",
  WARNING = "WARNING",
  ERROR = "ERROR",
  TESTING = "TESTING",
}

export enum ConnectionActivationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum TriggerType {
  SCHEDULE = "SCHEDULE",
  WEBHOOK = "WEBHOOK",
  API = "API",
}

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
  ERROR = "ERROR",
  /** Set by the runtime when circuit breaker policy opens after failure threshold is reached. */
  BREAK = "BREAK",
}

export enum ExecutionStatus {
  CREATED = "CREATED",
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  VALIDATING = "VALIDATING",
  MAPPING = "MAPPING",
  TRANSFORMING = "TRANSFORMING",
  ROUTING = "ROUTING",
  DELIVERING = "DELIVERING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  /** @deprecated Failed executions use FAILED; failed records are tracked in DLQ separately. */
  DLQ = "DLQ",
  CANCELLED = "CANCELLED",
}

export enum DlqStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REPLAYED = "REPLAYED",
  DISCARDED = "DISCARDED",
}

export enum RetryStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  EXHAUSTED = "EXHAUSTED",
  CANCELLED = "CANCELLED",
}

export enum RetryStrategy {
  FIXED = "FIXED",
  EXPONENTIAL = "EXPONENTIAL",
  DECORRELATED_JITTER = "DECORRELATED_JITTER",
  LINEAR = "LINEAR",
  CUSTOM = "CUSTOM",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SLACK = "SLACK",
  TEAMS = "TEAMS",
  WEBHOOK = "WEBHOOK",
}

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export enum ProviderCategory {
  MARKETPLACE = "MARKETPLACE",
  ERP = "ERP",
  CRM = "CRM",
  WMS = "WMS",
  PROTOCOL = "PROTOCOL",
  STORAGE = "STORAGE",
  CUSTOM = "CUSTOM",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXECUTE = "EXECUTE",
  REPLAY = "REPLAY",
  TEST = "TEST",
  LOGIN = "LOGIN",
  EXPORT = "EXPORT",
}

export enum AuditResult {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  PARTIAL = "PARTIAL",
}

export enum ProfileStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

export enum PlatformUserRole {
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  TENANT_OPERATOR = "TENANT_OPERATOR",
  TENANT_VIEWER = "TENANT_VIEWER",
}

export enum PlatformUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
