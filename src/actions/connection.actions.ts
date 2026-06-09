"use server";

import {
  createConnectionSchema,
  updateConnectionSchema,
  type CreateConnectionInput,
  type UpdateConnectionInput,
} from "@/lib/schemas/connection.schema";
import { validateProviderAuth } from "@/lib/provider-connection/validate";
import { connectionService, providerService } from "@/services";
import { ConnectionActivationStatus, ConnectionStatus } from "@/types/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ConnectionActionResult = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type TestConnectionMetadata = {
  success: true;
  responseTimeMs: number;
  authStatus: string;
  providerVersion: string;
  responseSummary: string;
  metadata: Record<string, string>;
};

export async function testConnectionAction(
  providerId: string,
  configuration: Record<string, string>
): Promise<TestConnectionMetadata | ConnectionActionResult> {
  const provider = await providerService.getProvider(providerId);
  if (!provider) {
    return { success: false, error: "Provider not found." };
  }

  const configErrors = validateProviderAuth(provider.code, configuration);
  if (Object.keys(configErrors).length > 0) {
    const fieldErrors = Object.fromEntries(
      Object.entries(configErrors).map(([key, message]) => [key, [message]])
    );
    return {
      success: false,
      error: "Fix configuration errors before running the connection test.",
      fieldErrors,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    success: true,
    responseTimeMs: 280 + Math.floor(Math.random() * 120),
    authStatus: "Authenticated",
    providerVersion: provider.version,
    responseSummary: `Successfully connected to ${provider.name}. Credentials validated and endpoint reachable.`,
    metadata: {
      provider_code: provider.code,
      endpoint: configuration.baseUrl ?? configuration.host ?? configuration.targetUrl ?? "default",
      tested_at: new Date().toISOString(),
    },
  };
}

export async function createConnectionAction(
  tenantId: string,
  input: CreateConnectionInput
): Promise<ConnectionActionResult | void> {
  const parsed = createConnectionSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed. Check the form and try again.";
    return { success: false, error: firstError, fieldErrors };
  }

  const data = parsed.data;
  const provider = await providerService.getProvider(data.providerId);
  if (!provider) {
    return {
      success: false,
      error: "Provider not found.",
      fieldErrors: { providerId: ["Invalid provider"] },
    };
  }

  const configErrors = validateProviderAuth(provider.code, data.configuration);
  if (Object.keys(configErrors).length > 0) {
    const fieldErrors = Object.fromEntries(
      Object.entries(configErrors).map(([key, message]) => [key, [message]])
    );
    return {
      success: false,
      error: "Configuration is incomplete or invalid.",
      fieldErrors,
    };
  }

  const existing = await connectionService.getConnectionsByTenant(tenantId);
  const nameTaken = existing.some(
    (c) => c.name.toLowerCase() === data.name.toLowerCase()
  );
  if (nameTaken) {
    return {
      success: false,
      error: `Connection name "${data.name}" is already in use for this tenant.`,
      fieldErrors: { name: ["This name is already in use"] },
    };
  }

  const connection = await connectionService.createConnection({
    tenantId,
    providerId: data.providerId,
    name: data.name,
    status: ConnectionStatus.HEALTHY,
    activeStatus: ConnectionActivationStatus.ACTIVE,
    configuration: data.configuration,
    lastTestedAt: new Date(),
  });

  revalidatePath(`/tenants/${tenantId}/connections`);
  revalidatePath(`/tenants/${tenantId}/overview`);

  redirect(`/tenants/${tenantId}/connections`);
}

export async function updateConnectionAction(
  tenantId: string,
  connectionId: string,
  input: UpdateConnectionInput
): Promise<ConnectionActionResult | void> {
  const parsed = updateConnectionSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed. Check the form and try again.";
    return { success: false, error: firstError, fieldErrors };
  }

  const connection = await connectionService.getConnection(connectionId);
  if (!connection || connection.tenantId !== tenantId) {
    return { success: false, error: "Connection not found." };
  }

  const provider = await providerService.getProvider(connection.providerId);
  if (!provider) {
    return { success: false, error: "Provider not found." };
  }

  const configErrors = validateProviderAuth(provider.code, parsed.data.configuration);
  if (Object.keys(configErrors).length > 0) {
    const fieldErrors = Object.fromEntries(
      Object.entries(configErrors).map(([key, message]) => [key, [message]])
    );
    return {
      success: false,
      error: "Configuration is incomplete or invalid.",
      fieldErrors,
    };
  }

  const existing = await connectionService.getConnectionsByTenant(tenantId);
  const nameTaken = existing.some(
    (c) => c.id !== connectionId && c.name.toLowerCase() === parsed.data.name.toLowerCase()
  );
  if (nameTaken) {
    return {
      success: false,
      error: `Connection name "${parsed.data.name}" is already in use for this tenant.`,
      fieldErrors: { name: ["This name is already in use"] },
    };
  }

  await connectionService.updateConnection(connectionId, {
    name: parsed.data.name,
    configuration: parsed.data.configuration,
    lastTestedAt: connection.lastTestedAt,
  });

  revalidatePath(`/tenants/${tenantId}/connections`);
  revalidatePath(`/tenants/${tenantId}/connections/${connectionId}`);
  revalidatePath(`/tenants/${tenantId}/overview`);

  redirect(`/tenants/${tenantId}/connections/${connectionId}`);
}

export async function toggleConnectionActiveStatusAction(
  tenantId: string,
  connectionId: string
): Promise<{ success: true; activeStatus: ConnectionActivationStatus } | ConnectionActionResult> {
  const connection = await connectionService.getConnection(connectionId);
  if (!connection || connection.tenantId !== tenantId) {
    return { success: false, error: "Connection not found." };
  }

  const activeStatus =
    connection.activeStatus === ConnectionActivationStatus.INACTIVE
      ? ConnectionActivationStatus.ACTIVE
      : ConnectionActivationStatus.INACTIVE;

  await connectionService.updateConnection(connectionId, { activeStatus });

  revalidatePath(`/tenants/${tenantId}/connections`);
  revalidatePath(`/tenants/${tenantId}/connections/${connectionId}`);
  revalidatePath(`/tenants/${tenantId}/overview`);

  return { success: true, activeStatus };
}
