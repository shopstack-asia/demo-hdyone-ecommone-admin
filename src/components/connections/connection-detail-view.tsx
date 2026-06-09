"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toggleConnectionActiveStatusAction, updateConnectionAction } from "@/actions/connection.actions";
import { ConnectionStatusBadges } from "@/components/connections/connection-status-badges";
import { ReviewStep } from "@/components/connections/provider-setup/steps/review-step";
import { getProviderAuthSetup } from "@/components/connections/provider-setup/registry";
import { ValidationResultPanel } from "@/components/connections/provider-setup/shared/validation-result-panel";
import { connectionToFormValues } from "@/lib/connection-form-values";
import {
  buildHealthMetrics,
  simulateMetadataDiscovery,
  simulateValidation,
} from "@/lib/provider-connection/simulate";
import { validateProviderAuth } from "@/lib/provider-connection/validate";
import {
  isMarketplaceProvider,
  mergeMarketplaceCredentials,
} from "@/lib/provider-connection/marketplace-credentials";
import type { ConnectionHealthMetrics, DiscoveredMetadata, ValidationResult } from "@/lib/provider-connection/types";
import { updateConnectionSchema, type UpdateConnectionInput } from "@/lib/schemas/connection.schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/wizard/field-error";
import type { Connection, Provider } from "@/types/domain";
import { ConnectionActivationStatus, ConnectionStatus } from "@/types/enums";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

interface ConnectionDetailViewProps {
  tenantId: string;
  connection: Connection;
  provider: Provider;
}

export function ConnectionDetailView({ tenantId, connection, provider }: ConnectionDetailViewProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState(connection.status);
  const [activeStatus, setActiveStatus] = useState(connection.activeStatus);
  const [configErrors, setConfigErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<ConnectionHealthMetrics | null>(() => ({
    status: mapConnectionStatusToHealth(connection.status),
    responseTimeMs: 320,
    successRate: connection.status === ConnectionStatus.HEALTHY ? 99.2 : 94.5,
    lastTested: (connection.lastTestedAt ?? connection.updatedAt).toISOString(),
  }));
  const [discoveredMetadata, setDiscoveredMetadata] = useState<DiscoveredMetadata | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isStatusPending, startStatusTransition] = useTransition();
  const [marketplaceCredentialDraft, setMarketplaceCredentialDraft] = useState<Record<string, string>>({});
  const [marketplaceCredentialsDirty, setMarketplaceCredentialsDirty] = useState(false);

  const handleMarketplaceCredentialsChange = useCallback((draft: Record<string, string>, dirty: boolean) => {
    setMarketplaceCredentialDraft(draft);
    setMarketplaceCredentialsDirty(dirty);
  }, []);

  const isActive = activeStatus === ConnectionActivationStatus.ACTIVE;

  const AuthSetup = getProviderAuthSetup(provider.code);

  const form = useForm<UpdateConnectionInput>({
    resolver: zodResolver(updateConnectionSchema),
    defaultValues: connectionToFormValues(connection),
    mode: "onBlur",
  });

  const { register, watch, setValue, getValues, formState: { errors } } = form;
  const values = watch();

  const handleConfigChange = (key: string, value: string) => {
    const current = getValues("configuration") ?? {};
    setValue("configuration", { ...current, [key]: value }, { shouldDirty: true });
    setConfigErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleBulkConfigChange = (patch: Record<string, string>) => {
    const current = getValues("configuration") ?? {};
    setValue("configuration", { ...current, ...patch }, { shouldDirty: true });
    setConfigErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  const runTest = useCallback(async () => {
    setSubmitError(null);
    setIsTesting(true);
    try {
      const configuration = getValues("configuration") ?? {};
      const authErrors = validateProviderAuth(provider.code, configuration);
      if (Object.keys(authErrors).length > 0) {
        setConfigErrors(authErrors);
        setSubmitError("Fix configuration errors before testing the connection.");
        return;
      }

      const validation = await simulateValidation(provider.code, configuration);
      setValidationResult(validation);
      setHealthMetrics(buildHealthMetrics(validation));
      setHealthStatus(validation.success ? ConnectionStatus.HEALTHY : ConnectionStatus.ERROR);
      if (validation.success) {
        const metadata = await simulateMetadataDiscovery(provider.code, configuration);
        setDiscoveredMetadata(metadata);
      }
    } finally {
      setIsTesting(false);
    }
  }, [getValues, provider.code]);

  const handleSave = () => {
    setSubmitError(null);
    startTransition(async () => {
      let configuration = values.configuration ?? {};
      if (isMarketplaceProvider(provider.code) && marketplaceCredentialsDirty) {
        configuration = mergeMarketplaceCredentials(
          provider.code,
          configuration,
          marketplaceCredentialDraft
        );
      }

      const authErrors = validateProviderAuth(provider.code, configuration);
      if (Object.keys(authErrors).length > 0) {
        setConfigErrors(authErrors);
        setSubmitError(
          marketplaceCredentialsDirty && authErrors.oauth
            ? "Re-authorize after updating partner application credentials."
            : "Configuration is incomplete or invalid."
        );
        return;
      }

      const result = await updateConnectionAction(tenantId, connection.id, {
        ...values,
        configuration,
      });
      if (result && !result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors) {
          const next: Record<string, string> = {};
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) next[key] = messages[0];
          }
          setConfigErrors(next);
        }
      }
    });
  };

  const handleToggleActiveStatus = () => {
    setSubmitError(null);
    startStatusTransition(async () => {
      const result = await toggleConnectionActiveStatusAction(tenantId, connection.id);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setActiveStatus(result.activeStatus);
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href={`/tenants/${tenantId}/connections`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{connection.name}</h1>
            <ConnectionStatusBadges connection={{ status: healthStatus, activeStatus }} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {provider.name} · {provider.category.toLowerCase()} · <span className="font-mono">{connection.id}</span>
          </p>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not save connection</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <ReviewStep
        provider={provider}
        connectionName={values.name}
        configuration={values.configuration ?? {}}
        health={healthMetrics}
        metadata={discoveredMetadata}
        onRetest={runTest}
        isRetesting={isTesting}
        connectionMeta={{
          lastUsedAt: connection.lastUsedAt,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
        }}
      />

      {validationResult && (
        <ValidationResultPanel result={validationResult} health={healthMetrics ?? undefined} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-w-3xl">
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection name</Label>
            <Input
              id="connection-name"
              maxLength={120}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {AuthSetup ? (
            <AuthSetup
              mode="edit"
              configuration={values.configuration ?? {}}
              onChange={handleConfigChange}
              onBulkChange={handleBulkConfigChange}
              errors={configErrors}
              oauthConnected={values.configuration?.oauthConnected === "true"}
              onMarketplaceCredentialsChange={handleMarketplaceCredentialsChange}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No dedicated setup available for this provider.</p>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex justify-between gap-4 max-w-[1400px] mx-auto">
          <Link href={`/tenants/${tenantId}/connections`}>
            <Button type="button" variant="outline" className="min-h-11" disabled={isPending || isStatusPending}>
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-h-11",
                !isActive && "border-success-subtle-foreground/30 text-success-subtle-foreground hover:bg-success-subtle/30"
              )}
              onClick={handleToggleActiveStatus}
              disabled={isPending || isStatusPending}
            >
              {isStatusPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isActive ? "Disable" : "Enable"}
            </Button>
            <Button type="button" className="min-h-11" onClick={handleSave} disabled={isPending || isStatusPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function mapConnectionStatusToHealth(
  status: ConnectionStatus
): ConnectionHealthMetrics["status"] {
  if (status === ConnectionStatus.ERROR) return "ERROR";
  if (status === ConnectionStatus.WARNING) return "WARNING";
  return "HEALTHY";
}
