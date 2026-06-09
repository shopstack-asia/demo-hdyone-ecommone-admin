import type { CreateIntegrationInput } from "@/lib/schemas/integration.schema";
import {
  mergeCircuitBreaker,
  mergeExecutionPolicy,
  mergeFailureNotification,
  mergeIdempotency,
  mergeRetryPolicy,
  normalizeTriggerConfig,
} from "@/lib/integration-runtime-defaults";
import type { Integration } from "@/types/domain";
import { TriggerType } from "@/types/enums";

export function integrationToFormValues(
  integration: Integration,
  mappingProfileCode?: string
): CreateIntegrationInput {
  const triggerConfig = normalizeTriggerConfig(
    integration.triggerConfig as Record<string, unknown> | undefined,
    integration.tenantId,
    integration.code,
    integration.triggerType ?? TriggerType.SCHEDULE
  );

  return {
    code: integration.code,
    name: integration.name,
    description: integration.description ?? "",
    tags: integration.tags?.join(", ") ?? "",
    owner: integration.owner ?? "",
    sourceConnectionId: integration.sourceConnectionId ?? "",
    destinationConnectionId: integration.destinationConnectionId ?? "",
    dataFlowId: integration.dataFlowId ?? "",
    triggerType: integration.triggerType ?? TriggerType.SCHEDULE,
    triggerConfig,
    mappingProfileCode,
    useSuggestedProfiles: true,
    executionPolicy: mergeExecutionPolicy(integration.executionPolicy),
    retryPolicy: mergeRetryPolicy(integration.retryPolicy),
    failureNotification: mergeFailureNotification(integration.failureNotification),
    circuitBreaker: mergeCircuitBreaker(integration.circuitBreaker),
    idempotency: mergeIdempotency(integration.idempotency),
  };
}

export function inferInitialWizardStep(integration: Integration): number {
  if (!integration.code || !integration.name) return 0;
  if (!integration.sourceConnectionId) return 2;
  if (!integration.dataFlowId) return 3;
  if (!integration.destinationConnectionId) return 4;
  return 0;
}

export function createEmptyFormValues(): CreateIntegrationInput {
  return {
    code: "",
    name: "",
    description: "",
    tags: "",
    owner: "",
    sourceConnectionId: "",
    destinationConnectionId: "",
    dataFlowId: "",
    triggerType: TriggerType.SCHEDULE,
    triggerConfig: {
      cronExpression: "0 */15 * * * *",
      timezone: "Asia/Bangkok",
      enabled: true,
      signatureVerificationEnabled: true,
      apiKeyRequired: true,
      allowedMethods: ["POST"],
      manualRunEnabled: true,
    },
    useSuggestedProfiles: true,
    executionPolicy: mergeExecutionPolicy(),
    retryPolicy: mergeRetryPolicy(),
    failureNotification: mergeFailureNotification(),
    circuitBreaker: mergeCircuitBreaker(),
    idempotency: mergeIdempotency(),
  };
}