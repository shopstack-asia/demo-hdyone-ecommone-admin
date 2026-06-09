import type {
  IntegrationCircuitBreakerConfig,
  IntegrationExecutionPolicyConfig,
  IntegrationFailureNotificationConfig,
  IntegrationIdempotencyConfig,
  IntegrationRetryPolicyConfig,
  IntegrationTriggerConfig,
} from "@/types/domain";
import { NotificationChannel, RetryStrategy, TriggerType } from "@/types/enums";

export const IDEMPOTENCY_TOKENS = [
  "tenant_id",
  "integration_id",
  "execution_id",
  "source_connection_id",
  "destination_connection_id",
  "data_flow_code",
  "source_reference_id",
  "file_name",
  "record_id",
] as const;

export type IdempotencyToken = (typeof IDEMPOTENCY_TOKENS)[number];

export const DEFAULT_EXECUTION_POLICY: IntegrationExecutionPolicyConfig = {
  batchSize: 1000,
  chunkSize: 100,
  maxParallelChunks: 10,
  requestsPerSecond: 20,
  unlimitedRequestRate: false,
  executionTimeoutSeconds: 900,
};

export const DEFAULT_RETRY_POLICY: IntegrationRetryPolicyConfig = {
  enabled: true,
  strategy: RetryStrategy.EXPONENTIAL,
  maxRetryCount: 5,
  initialRetryIntervalSeconds: 60,
  maxRetryIntervalSeconds: 3600,
  maxRetryDays: 7,
  unlimitedRetryWindow: false,
};

export const DEFAULT_FAILURE_NOTIFICATION: IntegrationFailureNotificationConfig = {
  notifyOnFailure: true,
  channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
  emails: ["ops@example.com", "integration-team@example.com"],
};

export const DEFAULT_CIRCUIT_BREAKER: IntegrationCircuitBreakerConfig = {
  enabled: true,
  failureThreshold: 5,
  openDurationSeconds: 60,
  halfOpenProbeCount: 3,
  successThreshold: 2,
  minimumRequestVolume: 10,
};

export const DEFAULT_IDEMPOTENCY: IntegrationIdempotencyConfig = {
  enabled: true,
  keyTemplate: ["tenant_id", "integration_id", "source_reference_id"],
};

export function normalizeTriggerConfig(
  raw: Record<string, unknown> | undefined,
  tenantId: string,
  code: string,
  triggerType: TriggerType
): IntegrationTriggerConfig {
  const config = raw ?? {};

  if (triggerType === TriggerType.SCHEDULE) {
    return {
      cronExpression:
        (config.cronExpression as string | undefined) ??
        (config.cron as string | undefined) ??
        "0 */15 * * * *",
      timezone: (config.timezone as string | undefined) ?? "Asia/Bangkok",
      enabled: (config.enabled as boolean | undefined) ?? true,
      pollingMode: config.pollingMode as boolean | undefined,
      sourcePath:
        (config.sourcePath as string | undefined) ??
        (config.pollingDirectory as string | undefined),
      filePattern: config.filePattern as string | undefined,
      processedPath:
        (config.processedPath as string | undefined) ??
        (config.processedFolder as string | undefined),
      errorPath:
        (config.errorPath as string | undefined) ??
        (config.errorFolder as string | undefined),
    };
  }

  if (triggerType === TriggerType.WEBHOOK) {
    const allowedIps = config.allowedIps;
    return {
      webhookUrl:
        (config.webhookUrl as string | undefined) ??
        `https://hooks.commerceone.io/${tenantId}/${code.toLowerCase()}`,
      signingSecret: config.signingSecret as string | undefined,
      signatureVerificationEnabled:
        (config.signatureVerificationEnabled as boolean | undefined) ??
        (config.signatureVerification as boolean | undefined) ??
        true,
      allowedIps: Array.isArray(allowedIps)
        ? (allowedIps as string[])
        : typeof allowedIps === "string" && allowedIps.trim()
          ? allowedIps.split(",").map((ip) => ip.trim()).filter(Boolean)
          : [],
    };
  }

  const allowedMethods = config.allowedMethods;
  return {
    apiEndpoint:
      (config.apiEndpoint as string | undefined) ??
      `https://api.commerceone.io/v1/integrations/${code.toLowerCase()}/run`,
    apiKeyRequired: (config.apiKeyRequired as boolean | undefined) ?? true,
    allowedMethods: Array.isArray(allowedMethods)
      ? (allowedMethods as string[])
      : typeof allowedMethods === "string" && allowedMethods.trim()
        ? allowedMethods.split(",").map((m) => m.trim()).filter(Boolean)
        : ["POST"],
    manualRunEnabled: (config.manualRunEnabled as boolean | undefined) ?? true,
  };
}

export function mergeExecutionPolicy(
  value?: Partial<IntegrationExecutionPolicyConfig>
): IntegrationExecutionPolicyConfig {
  return { ...DEFAULT_EXECUTION_POLICY, ...value };
}

export function mergeRetryPolicy(
  value?: Partial<IntegrationRetryPolicyConfig>
): IntegrationRetryPolicyConfig {
  return { ...DEFAULT_RETRY_POLICY, ...value };
}

export function mergeFailureNotification(
  value?: Partial<IntegrationFailureNotificationConfig>
): IntegrationFailureNotificationConfig {
  return {
    ...DEFAULT_FAILURE_NOTIFICATION,
    ...value,
    channels: value?.channels ?? DEFAULT_FAILURE_NOTIFICATION.channels,
    emails: value?.emails ?? DEFAULT_FAILURE_NOTIFICATION.emails,
  };
}

export function mergeCircuitBreaker(
  value?: Partial<IntegrationCircuitBreakerConfig>
): IntegrationCircuitBreakerConfig {
  return { ...DEFAULT_CIRCUIT_BREAKER, ...value };
}

export function mergeIdempotency(
  value?: Partial<IntegrationIdempotencyConfig>
): IntegrationIdempotencyConfig {
  return {
    ...DEFAULT_IDEMPOTENCY,
    ...value,
    keyTemplate: value?.keyTemplate?.length
      ? value.keyTemplate
      : DEFAULT_IDEMPOTENCY.keyTemplate,
  };
}

export function buildIdempotencyPreview(
  keyTemplate: string[],
  sample: Record<string, string>
): string {
  return keyTemplate.map((token) => sample[token] ?? token).join(" + ");
}

export function generateSigningSecret(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
