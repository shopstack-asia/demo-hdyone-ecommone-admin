"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createConnectionAction } from "@/actions/connection.actions";
import { createConnectionSchema, type CreateConnectionInput } from "@/lib/schemas/connection.schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/wizard/field-error";
import { WizardLayout } from "@/components/wizard/wizard-layout";
import { ProviderInfoStep } from "@/components/connections/provider-setup/steps/provider-info-step";
import { ReviewStep } from "@/components/connections/provider-setup/steps/review-step";
import { ValidationResultPanel } from "@/components/connections/provider-setup/shared/validation-result-panel";
import { MetadataPanel } from "@/components/connections/provider-setup/shared/metadata-panel";
import { getProviderAuthSetup } from "@/components/connections/provider-setup/registry";
import {
  simulateValidation,
  simulateMetadataDiscovery,
  buildHealthMetrics,
} from "@/lib/provider-connection/simulate";
import { validateProviderAuth } from "@/lib/provider-connection/validate";
import { WIZARD_STEPS } from "@/lib/provider-connection/types";
import type {
  ValidationResult,
  DiscoveredMetadata,
  ConnectionHealthMetrics,
} from "@/lib/provider-connection/types";
import { AlertCircle, Loader2 } from "lucide-react";

interface CreateConnectionFormProps {
  tenantId: string;
  providers: import("@/types/domain").Provider[];
}

export function CreateConnectionForm({ tenantId, providers }: CreateConnectionFormProps) {
  const [step, setStep] = useState(0);
  const [providerSearch, setProviderSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [configErrors, setConfigErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<ConnectionHealthMetrics | null>(null);
  const [discoveredMetadata, setDiscoveredMetadata] = useState<DiscoveredMetadata | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateConnectionInput>({
    resolver: zodResolver(createConnectionSchema),
    defaultValues: { providerId: "", name: "", configuration: {} },
    mode: "onBlur",
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const values = watch();
  const selectedProvider = providers.find((p) => p.id === values.providerId) ?? null;
  const AuthSetup = selectedProvider ? getProviderAuthSetup(selectedProvider.code) : null;

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(providerSearch.toLowerCase()) ||
      (p.description?.toLowerCase().includes(providerSearch.toLowerCase()) ?? false)
  );

  const resetValidationState = useCallback(() => {
    setValidationResult(null);
    setHealthMetrics(null);
    setDiscoveredMetadata(null);
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    const current = getValues("configuration") ?? {};
    setValue("configuration", { ...current, [key]: value }, { shouldValidate: false });
    setConfigErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    resetValidationState();
  };

  const handleBulkConfigChange = (updates: Record<string, string>) => {
    const current = getValues("configuration") ?? {};
    setValue("configuration", { ...current, ...updates }, { shouldValidate: false });
    setConfigErrors({});
    resetValidationState();
  };

  const runValidation = useCallback(async () => {
    if (!selectedProvider) return;
    setIsValidating(true);
    setSubmitError(null);
    try {
      const result = await simulateValidation(selectedProvider.code, values.configuration);
      setValidationResult(result);
      if (result.success) {
        setHealthMetrics(buildHealthMetrics(result));
      }
    } finally {
      setIsValidating(false);
    }
  }, [selectedProvider, values.configuration]);

  const runMetadataDiscovery = useCallback(async () => {
    if (!selectedProvider || !validationResult?.success) return;
    setIsDiscovering(true);
    try {
      const metadata = await simulateMetadataDiscovery(selectedProvider.code, values.configuration);
      setDiscoveredMetadata(metadata);
    } finally {
      setIsDiscovering(false);
    }
  }, [selectedProvider, validationResult?.success, values.configuration]);

  useEffect(() => {
    if (step === 2 && !validationResult && !isValidating && selectedProvider) {
      void runValidation();
    }
  }, [step, validationResult, isValidating, selectedProvider, runValidation]);

  useEffect(() => {
    if (step === 3 && validationResult?.success && !discoveredMetadata && !isDiscovering) {
      void runMetadataDiscovery();
    }
  }, [step, validationResult?.success, discoveredMetadata, isDiscovering, runMetadataDiscovery]);

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) return trigger("providerId");
    if (step === 1 && selectedProvider) {
      const nameValid = await trigger("name");
      const fieldErrors = validateProviderAuth(selectedProvider.code, values.configuration);
      setConfigErrors(fieldErrors);
      return nameValid && Object.keys(fieldErrors).length === 0;
    }
    if (step === 2) return validationResult?.success === true;
    if (step === 3) return discoveredMetadata !== null;
    return true;
  };

  const handleNext = async () => {
    setSubmitError(null);
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSave = () => {
    if (!validationResult?.success) {
      setSubmitError("Complete connection validation before saving.");
      return;
    }
    setSubmitError(null);

    const configWithMeta: Record<string, string> = {
      ...values.configuration,
      _validatedAt: new Date().toISOString(),
    };
    if (healthMetrics) {
      configWithMeta._healthMetrics = JSON.stringify(healthMetrics);
    }
    if (discoveredMetadata) {
      configWithMeta._metadata = JSON.stringify(discoveredMetadata);
    }

    startTransition(async () => {
      const result = await createConnectionAction(tenantId, {
        ...values,
        configuration: configWithMeta,
      });
      if (result && !result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors?.providerId) setStep(0);
        else if (result.fieldErrors?.name) setStep(1);
        else setStep(1);
      }
    });
  };

  const handleSelectProvider = (id: string) => {
    setValue("providerId", id, { shouldValidate: true });
    setValue("configuration", {});
    setConfigErrors({});
    resetValidationState();
  };

  const footerActions = (() => {
    if (step === 2) {
      return (
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={runValidation} disabled={isValidating} className="min-h-11">
            {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {validationResult ? "Re-run validation" : "Run validation"}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isValidating || validationResult?.success !== true}
            className="min-h-11"
          >
            Next
          </Button>
        </div>
      );
    }
    if (step === 3) {
      return (
        <Button
          type="button"
          onClick={handleNext}
          disabled={isDiscovering || !discoveredMetadata}
          className="min-h-11"
        >
          {isDiscovering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Next
        </Button>
      );
    }
    if (step === 4) {
      return (
        <Button type="button" onClick={handleSave} disabled={isPending} className="min-h-11">
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save connection
        </Button>
      );
    }
    return undefined;
  })();

  return (
    <WizardLayout
      title="Create connection"
      description="Set up a provider-specific connection with authentication, validation, and metadata discovery."
      steps={[...WIZARD_STEPS]}
      currentStep={step}
      cancelHref={`/tenants/${tenantId}/connections`}
      onBack={handleBack}
      onNext={handleNext}
      showNext={step < 2 || step === 0 || step === 1}
      isPending={isPending || isValidating || isDiscovering}
      isNextDisabled={step === 0 && providers.length === 0}
      footerActions={footerActions}
    >
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not save connection</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <ProviderInfoStep
          providers={providers}
          filteredProviders={filteredProviders}
          providerSearch={providerSearch}
          onSearchChange={setProviderSearch}
          selectedProviderId={values.providerId}
          onSelectProvider={handleSelectProvider}
          providerError={errors.providerId?.message}
        />
      )}

      {step === 1 && selectedProvider && (
        <div className="space-y-6">
          <div className="space-y-2 max-w-2xl">
            <Label htmlFor="connection-name">Connection name</Label>
            <Input
              id="connection-name"
              placeholder={`${selectedProvider.name} Production`}
              maxLength={120}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>
          {AuthSetup ? (
            <AuthSetup
              configuration={values.configuration}
              onChange={handleConfigChange}
              onBulkChange={handleBulkConfigChange}
              errors={configErrors}
              oauthConnected={values.configuration.oauthConnected === "true"}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No dedicated setup available for this provider.</p>
          )}
        </div>
      )}

      {step === 2 && selectedProvider && (
        <div className="max-w-2xl space-y-4">
          {isValidating && !validationResult ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Testing connection to {selectedProvider.name}…</p>
            </div>
          ) : validationResult ? (
            <ValidationResultPanel result={validationResult} health={healthMetrics ?? undefined} />
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Click &ldquo;Run validation&rdquo; to test connectivity.
            </p>
          )}
        </div>
      )}

      {step === 3 && selectedProvider && (
        <div className="max-w-2xl">
          {isDiscovering && !discoveredMetadata ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Discovering metadata from {selectedProvider.name}…</p>
            </div>
          ) : discoveredMetadata ? (
            <MetadataPanel metadata={discoveredMetadata} />
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">Metadata discovery pending validation.</p>
          )}
        </div>
      )}

      {step === 4 && selectedProvider && (
        <ReviewStep
          provider={selectedProvider}
          connectionName={values.name}
          configuration={values.configuration}
          health={healthMetrics}
          metadata={discoveredMetadata}
          onRetest={() => {
            resetValidationState();
            setStep(2);
          }}
          onRotateCredentials={() => setStep(1)}
          isRetesting={isValidating}
        />
      )}
    </WizardLayout>
  );
}
