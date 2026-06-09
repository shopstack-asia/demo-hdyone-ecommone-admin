import type {
  AuditAction,
  AuditResult,
  CircuitBreakerState,
  ConnectionActivationStatus,
  ConnectionStatus,
  DlqStatus,
  ExecutionStatus,
  IntegrationStatus,
  NotificationChannel,
  ProfileStatus,
  ProviderCapability,
  ProviderCategory,
  RetryStatus,
  RetryStrategy,
  TenantStatus,
  TriggerType,
  PlatformUserRole,
  PlatformUserStatus,
} from "./enums";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigSchemaField {
  key: string;
  label: string;
  type: "text" | "password" | "number" | "select" | "boolean" | "url" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface ProviderDataFlow {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  direction: "SOURCE" | "DESTINATION" | "BOTH";
  supportedTriggers: TriggerType[];
  recommendedTrigger: TriggerType;
  defaultBatchSize?: number;
  defaultChunkSize?: number;
  defaultMappingTemplateCode?: string;
  defaultValidationProfileCode?: string;
  defaultTransformationProfileCode?: string;
  defaultRoutingProfileCode?: string;
  defaultExecutionPolicyCode?: string;
  defaultRetryPolicyCode?: string;
  requiredSourceCapabilities: string[];
  supportedDestinationCategories: string[];
}

export interface Provider extends BaseEntity {
  code: string;
  name: string;
  category: ProviderCategory;
  version: string;
  capabilities: ProviderCapability[];
  configurationSchema: ConfigSchemaField[];
  supportedTriggers: TriggerType[];
  dataFlows: ProviderDataFlow[];
  icon?: string;
  description?: string;
}

export interface Tenant extends BaseEntity {
  code: string;
  name: string;
  country: string;
  timezone: string;
  status: TenantStatus;
  description?: string;
}

export interface Connection extends BaseEntity {
  tenantId: string;
  providerId: string;
  name: string;
  status: ConnectionStatus;
  activeStatus: ConnectionActivationStatus;
  configuration: Record<string, unknown>;
  lastTestedAt?: Date;
  lastUsedAt?: Date;
}

export interface ValidationProfile extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  rules: Record<string, unknown>;
  status: ProfileStatus;
}

export interface MappingProfile extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  mappings: Record<string, unknown>;
  status: ProfileStatus;
}

export interface TransformationProfile extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  rules: Record<string, unknown>;
  status: ProfileStatus;
}

export interface RoutingProfile extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  rules: Record<string, unknown>;
  status: ProfileStatus;
}

export interface ExecutionPolicy extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  status: ProfileStatus;
}

export interface RetryPolicy extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  strategy: RetryStrategy;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  config: Record<string, unknown>;
  status: ProfileStatus;
}

export interface RetentionPolicy extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  executionRetentionDays: number;
  dlqRetentionDays: number;
  auditRetentionDays: number;
  status: ProfileStatus;
}

export interface IntegrationTriggerConfig {
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
  pollingMode?: boolean;
  sourcePath?: string;
  filePattern?: string;
  processedPath?: string;
  errorPath?: string;
  webhookUrl?: string;
  signingSecret?: string;
  signatureVerificationEnabled?: boolean;
  allowedIps?: string[];
  apiEndpoint?: string;
  apiKeyRequired?: boolean;
  allowedMethods?: string[];
  manualRunEnabled?: boolean;
}

export interface IntegrationExecutionPolicyConfig {
  batchSize: number;
  chunkSize: number;
  maxParallelChunks: number;
  requestsPerSecond: number | null;
  unlimitedRequestRate: boolean;
  executionTimeoutSeconds: number;
}

export interface IntegrationRetryPolicyConfig {
  enabled: boolean;
  strategy: RetryStrategy;
  maxRetryCount: number;
  initialRetryIntervalSeconds: number;
  maxRetryIntervalSeconds: number;
  maxRetryDays: number | null;
  unlimitedRetryWindow: boolean;
}

export interface IntegrationFailureNotificationConfig {
  notifyOnFailure: boolean;
  channels: NotificationChannel[];
  emails: string[];
  webhookUrl?: string;
}

export interface IntegrationCircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  openDurationSeconds: number;
  halfOpenProbeCount: number;
  successThreshold: number;
  minimumRequestVolume: number;
}

export interface IntegrationIdempotencyConfig {
  enabled: boolean;
  keyTemplate: string[];
}

export interface Integration extends BaseEntity {
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  tags?: string[];
  owner?: string;
  sourceConnectionId: string;
  destinationConnectionId: string;
  sourceProviderId?: string;
  destinationProviderId?: string;
  dataFlowId: string;
  triggerType: TriggerType;
  validationProfileId?: string;
  mappingProfileId?: string;
  transformationProfileId?: string;
  routingProfileId?: string;
  executionPolicyId?: string;
  retryPolicyId?: string;
  status: IntegrationStatus;
  lastRunAt?: Date;
  successRate: number;
  triggerConfig?: IntegrationTriggerConfig;
  executionPolicy?: IntegrationExecutionPolicyConfig;
  retryPolicy?: IntegrationRetryPolicyConfig;
  failureNotification?: IntegrationFailureNotificationConfig;
  circuitBreaker?: IntegrationCircuitBreakerConfig;
  idempotency?: IntegrationIdempotencyConfig;
}

export interface ExecutionTimelineEvent {
  stage: ExecutionStatus;
  timestamp: Date;
  message?: string;
  durationMs?: number;
}

export interface ExecutionStage {
  stageId: "SOURCE" | "VALIDATION" | "MAPPING" | "TRANSFORMATION" | "DELIVERY";
  label: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";
  durationMs: number;
  recordsProcessed: number;
  recordsFailed: number;
  percentageOfTotalTime: number;
  errorCode?: string;
  errorMessage?: string;
  targetSystem?: string;
}

export interface ExecutionFailureAnalysis {
  failureStageId: ExecutionStage["stageId"];
  errorCode: string;
  errorMessage: string;
  failedRecords: number;
  affectedChunks: number;
  affectedBatch: string;
  firstFailureAt: Date;
  recommendedAction: string;
}

export interface ExecutionOperationalRetrySummary {
  strategy: string;
  currentAttempt: number;
  maxAttempts: number;
  nextRetryAt: Date;
  lastErrorCode: string;
  retryScope: string;
}

export interface ExecutionPerformanceAnalysis {
  slowestStageId: ExecutionStage["stageId"];
  slowestStageLabel: string;
  slowestStageDurationMs: number;
  slowestStageShare: number;
  averageResponseTimeMs: number;
  recordsPerSecond: number;
  apiCalls: number;
  bottleneckAssessment: string;
}

export interface ExecutionLiveStatus {
  currentStageId: ExecutionStage["stageId"];
  recordsProcessed: number;
  totalRecords: number;
  currentChunk: number;
  totalChunks: number;
  runningDurationMs: number;
  estimatedRemainingMs: number;
  workerId: string;
}

export interface ExecutionOperationalInsight {
  failureAnalysis?: ExecutionFailureAnalysis;
  retrySummary?: ExecutionOperationalRetrySummary;
  performanceAnalysis?: ExecutionPerformanceAnalysis;
  liveStatus?: ExecutionLiveStatus;
}

export interface ExecutionErrorDistribution {
  errorCode: string;
  count: number;
}

export interface ExecutionErrorSummary {
  errorCount: number;
  topError?: string;
  affectedRecords: number;
  failureStageId?: ExecutionStage["stageId"];
  distribution: ExecutionErrorDistribution[];
}

export interface ExecutionErrorRecord extends BaseEntity {
  tenantId: string;
  executionId: string;
  integrationId: string;
  recordKey: string;
  stageId: ExecutionStage["stageId"];
  chunkNumber?: number;
  errorCode: string;
  errorMessage: string;
  fieldPath?: string;
  payload?: Record<string, unknown>;
  stackTrace?: string;
}

export interface ExecutionRetrySummary {
  enabled: boolean;
  strategy?: RetryStrategy;
  maxAttempts: number;
  currentAttempt: number;
  nextRetryAt?: Date;
}

export interface ExecutionDlqSummary {
  recordCount: number;
  reason?: string;
  status?: DlqStatus;
}

export interface Execution extends BaseEntity {
  tenantId: string;
  integrationId: string;
  triggerType: TriggerType;
  status: ExecutionStatus;
  environment: string;
  startedAt: Date;
  finishedAt?: Date;
  durationMs?: number;
  retryCount: number;
  chunkCount: number;
  chunksCompleted: number;
  chunksFailed: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  dlqRecordCount: number;
  apiCalls: number;
  averageResponseTimeMs: number;
  recordsPerSecond: number;
  chunkThroughput: number;
  timeline: ExecutionTimelineEvent[];
  executionStages: ExecutionStage[];
  operationalInsight: ExecutionOperationalInsight;
  retrySummary: ExecutionRetrySummary;
  errorSummary?: ExecutionErrorSummary;
  dlqSummary?: ExecutionDlqSummary;
  errorMessage?: string;
  errorCode?: string;
}

export interface DlqRecord extends BaseEntity {
  tenantId: string;
  executionId: string;
  integrationId: string;
  stage: ExecutionStatus;
  errorCode: string;
  errorMessage: string;
  retryCount: number;
  status: DlqStatus;
  payload?: Record<string, unknown>;
  stackTrace?: string;
}

export interface RetryRecord extends BaseEntity {
  tenantId: string;
  executionId: string;
  attempt: number;
  strategy: RetryStrategy;
  nextRetryAt: Date;
  status: RetryStatus;
  lastError?: string;
}

export interface CircuitBreaker extends BaseEntity {
  tenantId: string;
  providerId: string;
  connectionId: string;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt?: Date;
  nextProbeAt?: Date;
  threshold: number;
}

export interface AuditLog extends BaseEntity {
  tenantId?: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  result: AuditResult;
  details?: string;
  ipAddress?: string;
}

export interface PlatformSettings {
  id: string;
  platformName: string;
  defaultTimezone: string;
  maxConcurrentExecutions: number;
  defaultRetryPolicyId: string;
  defaultExecutionPolicyId: string;
  workerCount: number;
  maintenanceMode: boolean;
  updatedAt: Date;
}

export interface PlatformUser extends BaseEntity {
  name: string;
  email: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  allTenantsAccess: boolean;
  tenantIds: string[];
  lastLoginAt?: Date;
}

export interface TenantStats {
  tenantId: string;
  connectionsCount: number;
  integrationsCount: number;
  failedExecutionsCount: number;
  dlqCount: number;
  circuitBreakersOpen: number;
  successRate: number;
}

export interface DashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  totalProviders: number;
  totalConnections: number;
  totalIntegrations: number;
  runningExecutions: number;
  failedExecutions: number;
  dlqRecords: number;
  openCircuitBreakers: number;
  workerCount: number;
}

export interface TrendDataPoint {
  date: string;
  success: number;
  failed: number;
  retry: number;
  dlq: number;
}

export interface ProviderUsageDataPoint {
  provider: string;
  count: number;
}

export interface StatusDistributionDataPoint {
  status: string;
  count: number;
  fill?: string;
}
