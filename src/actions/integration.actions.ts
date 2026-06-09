"use server";

import { findDataFlowById } from "@/data/provider-data-flows";
import {
  normalizeTriggerConfig,
  mergeCircuitBreaker,
  mergeExecutionPolicy,
  mergeFailureNotification,
  mergeIdempotency,
  mergeRetryPolicy,
} from "@/lib/integration-runtime-defaults";
import {
  createIntegrationSchema,
  saveIntegrationDraftSchema,
  type CreateIntegrationInput,
  type SaveIntegrationDraftInput,
} from "@/lib/schemas/integration.schema";
import { resolveProfileIdsFromDataFlow } from "@/lib/integration-wizard/resolve-profiles";
import { connectionService, integrationService, providerService, systemConfigService } from "@/services";
import type { ProviderDataFlow } from "@/types/domain";
import { IntegrationStatus, TriggerType } from "@/types/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateIntegrationResult = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type SaveIntegrationDraftResult =
  | { success: true; integrationId: string }
  | CreateIntegrationResult;

function buildTriggerConfig(
  tenantId: string,
  code: string,
  triggerType: TriggerType,
  triggerConfig: CreateIntegrationInput["triggerConfig"]
) {
  return normalizeTriggerConfig(
    triggerConfig as Record<string, unknown> | undefined,
    tenantId,
    code,
    triggerType
  );
}

function buildRuntimeConfig(data: CreateIntegrationInput | SaveIntegrationDraftInput) {
  return {
    executionPolicy: data.executionPolicy
      ? mergeExecutionPolicy(data.executionPolicy)
      : undefined,
    retryPolicy: data.retryPolicy ? mergeRetryPolicy(data.retryPolicy) : undefined,
    failureNotification: data.failureNotification
      ? mergeFailureNotification(data.failureNotification)
      : undefined,
    circuitBreaker: data.circuitBreaker
      ? mergeCircuitBreaker(data.circuitBreaker)
      : undefined,
    idempotency: data.idempotency ? mergeIdempotency(data.idempotency) : undefined,
  };
}

async function resolveProfilesForDraft(
  dataFlow: ProviderDataFlow | undefined,
  mappingProfileCode?: string
) {
  if (!dataFlow) return {};

  const [
    validationProfiles,
    mappingProfiles,
    transformationProfiles,
    routingProfiles,
    executionPolicies,
    retryPolicies,
  ] = await Promise.all([
    systemConfigService.getValidationProfiles(),
    systemConfigService.getMappingProfiles(),
    systemConfigService.getTransformationProfiles(),
    systemConfigService.getRoutingProfiles(),
    systemConfigService.getExecutionPolicies(),
    systemConfigService.getRetryPolicies(),
  ]);

  return resolveProfileIdsFromDataFlow(
    dataFlow,
    { validationProfiles, mappingProfiles, transformationProfiles, routingProfiles, executionPolicies, retryPolicies },
    { mappingProfileCode }
  );
}

export type SetIntegrationInactiveResult =
  | { success: true; status: IntegrationStatus.INACTIVE }
  | CreateIntegrationResult;

export async function setIntegrationInactiveAction(
  tenantId: string,
  integrationId: string
): Promise<SetIntegrationInactiveResult> {
  const integration = await integrationService.getIntegration(integrationId);
  if (!integration || integration.tenantId !== tenantId) {
    return { success: false, error: "Integration not found." };
  }

  if (integration.status === IntegrationStatus.INACTIVE) {
    return { success: true, status: IntegrationStatus.INACTIVE };
  }

  const updated = await integrationService.updateIntegration(integrationId, {
    status: IntegrationStatus.INACTIVE,
  });
  if (!updated) {
    return { success: false, error: "Could not deactivate integration." };
  }

  revalidatePath(`/tenants/${tenantId}/integrations`);
  revalidatePath(`/tenants/${tenantId}/integrations/${integrationId}/edit`);
  revalidatePath(`/tenants/${tenantId}/overview`);

  return { success: true, status: IntegrationStatus.INACTIVE };
}

export async function saveIntegrationDraftAction(
  tenantId: string,
  input: SaveIntegrationDraftInput,
  integrationId?: string
): Promise<SaveIntegrationDraftResult> {
  const parsed = saveIntegrationDraftSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Enter at least integration code and name to save a draft.";
    return { success: false, error: firstError, fieldErrors };
  }

  const data = parsed.data;
  const code = data.code.toUpperCase();
  const triggerType = data.triggerType ?? TriggerType.SCHEDULE;
  const connections = await connectionService.getConnectionsByTenant(tenantId);
  const connectionIds = new Set(connections.map((c) => c.id));

  if (data.sourceConnectionId && !connectionIds.has(data.sourceConnectionId)) {
    return {
      success: false,
      error: "Source connection not found.",
      fieldErrors: { sourceConnectionId: ["Invalid connection"] },
    };
  }
  if (data.destinationConnectionId && !connectionIds.has(data.destinationConnectionId)) {
    return {
      success: false,
      error: "Destination connection not found.",
      fieldErrors: { destinationConnectionId: ["Invalid connection"] },
    };
  }

  const { data: providers } = await providerService.listProviders({ pageSize: 100 });
  const dataFlow = data.dataFlowId ? findDataFlowById(providers, data.dataFlowId) : undefined;
  if (data.dataFlowId && !dataFlow) {
    return { success: false, error: "Invalid data flow.", fieldErrors: { dataFlowId: ["Data flow not found"] } };
  }

  const sourceConn = data.sourceConnectionId
    ? connections.find((c) => c.id === data.sourceConnectionId)
    : undefined;
  const destConn = data.destinationConnectionId
    ? connections.find((c) => c.id === data.destinationConnectionId)
    : undefined;

  if (dataFlow && sourceConn) {
    const sourceProvider = await providerService.getProvider(sourceConn.providerId);
    if (!sourceProvider?.dataFlows.some((f) => f.id === data.dataFlowId)) {
      return {
        success: false,
        error: "Selected data flow is not supported by the source provider.",
        fieldErrors: { dataFlowId: ["Invalid for source"] },
      };
    }
  }

  const existing = await integrationService.listIntegrations({ tenantId, pageSize: 500 });
  const duplicate = existing.data.find(
    (i) => i.code.toUpperCase() === code && i.id !== integrationId
  );
  if (duplicate) {
    return {
      success: false,
      error: `Integration code "${code}" is already in use.`,
      fieldErrors: { code: ["Already in use"] },
    };
  }

  const profileIds = await resolveProfilesForDraft(dataFlow, data.mappingProfileCode);
  const tags = data.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  const payload = {
    tenantId,
    code,
    name: data.name,
    description: data.description || undefined,
    tags,
    owner: data.owner || undefined,
    sourceConnectionId: data.sourceConnectionId ?? "",
    destinationConnectionId: data.destinationConnectionId ?? "",
    sourceProviderId: sourceConn?.providerId,
    destinationProviderId: destConn?.providerId,
    dataFlowId: data.dataFlowId ?? "",
    triggerType,
    status: IntegrationStatus.DRAFT,
    successRate: 0,
    triggerConfig: buildTriggerConfig(tenantId, code, triggerType, data.triggerConfig),
    ...buildRuntimeConfig(data),
    ...profileIds,
  };

  if (integrationId) {
    const current = await integrationService.getIntegration(integrationId);
    if (!current || current.tenantId !== tenantId) {
      return { success: false, error: "Draft integration not found." };
    }
    const updated = await integrationService.updateIntegration(integrationId, {
      ...payload,
      status: current.status,
      successRate: current.successRate,
    });
    if (!updated) {
      return { success: false, error: "Could not update draft integration." };
    }
    return { success: true, integrationId: updated.id };
  }

  const integration = await integrationService.createIntegration(payload);
  return { success: true, integrationId: integration.id };
}

export async function createIntegrationAction(
  tenantId: string,
  input: CreateIntegrationInput,
  integrationId?: string
): Promise<CreateIntegrationResult | void> {
  const parsed = createIntegrationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed. Check the form and try again.";
    return { success: false, error: firstError, fieldErrors };
  }

  const data = parsed.data;
  const connections = await connectionService.getConnectionsByTenant(tenantId);
  const connectionIds = new Set(connections.map((c) => c.id));
  const sourceConn = connections.find((c) => c.id === data.sourceConnectionId);
  const destConn = connections.find((c) => c.id === data.destinationConnectionId);

  if (!connectionIds.has(data.sourceConnectionId)) {
    return { success: false, error: "Source connection not found.", fieldErrors: { sourceConnectionId: ["Invalid connection"] } };
  }
  if (!connectionIds.has(data.destinationConnectionId)) {
    return { success: false, error: "Destination connection not found.", fieldErrors: { destinationConnectionId: ["Invalid connection"] } };
  }

  const { data: providers } = await providerService.listProviders({ pageSize: 100 });
  const dataFlow = findDataFlowById(providers, data.dataFlowId);
  if (!dataFlow) {
    return { success: false, error: "Invalid data flow.", fieldErrors: { dataFlowId: ["Data flow not found"] } };
  }

  const sourceProvider = sourceConn ? await providerService.getProvider(sourceConn.providerId) : null;
  if (!sourceProvider?.dataFlows.some((f) => f.id === data.dataFlowId)) {
    return { success: false, error: "Selected data flow is not supported by the source provider.", fieldErrors: { dataFlowId: ["Invalid for source"] } };
  }

  const existing = await integrationService.listIntegrations({ tenantId, pageSize: 500 });
  if (
    existing.data.some(
      (i) => i.code.toUpperCase() === data.code.toUpperCase() && i.id !== integrationId
    )
  ) {
    return { success: false, error: `Integration code "${data.code}" is already in use.`, fieldErrors: { code: ["Already in use"] } };
  }

  const profileIds = await resolveProfilesForDraft(dataFlow, data.mappingProfileCode);
  const tags = data.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  const triggerConfig = buildTriggerConfig(tenantId, data.code, data.triggerType, data.triggerConfig);

  const payload = {
    tenantId,
    code: data.code.toUpperCase(),
    name: data.name,
    description: data.description || undefined,
    tags,
    owner: data.owner || undefined,
    sourceConnectionId: data.sourceConnectionId,
    destinationConnectionId: data.destinationConnectionId,
    sourceProviderId: sourceConn?.providerId,
    destinationProviderId: destConn?.providerId,
    dataFlowId: data.dataFlowId,
    triggerType: data.triggerType,
    status: IntegrationStatus.DRAFT,
    successRate: 0,
    triggerConfig,
    ...buildRuntimeConfig(data),
    ...profileIds,
  };

  if (integrationId) {
    const current = await integrationService.getIntegration(integrationId);
    if (!current || current.tenantId !== tenantId) {
      return { success: false, error: "Draft integration not found." };
    }
    const updated = await integrationService.updateIntegration(integrationId, {
      ...payload,
      status: current.status,
      successRate: current.successRate,
    });
    if (!updated) {
      return { success: false, error: "Could not finalize integration." };
    }
    redirect(`/tenants/${tenantId}/integrations/${updated.id}/edit`);
  }

  const integration = await integrationService.createIntegration(payload);
  redirect(`/tenants/${tenantId}/integrations/${integration.id}/edit`);
}
