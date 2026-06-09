"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createIntegrationAction, saveIntegrationDraftAction } from "@/actions/integration.actions";
import {
  IntegrationConnectionsSection,
  IntegrationGeneralSection,
  IntegrationProfilesSummary,
  IntegrationTriggerSection,
} from "@/components/integrations/integration-config-sections";
import { MappingStep } from "@/components/integrations/mapping/mapping-step";
import { IntegrationPolicySection } from "@/components/integrations/integration-policy-section";
import { buildIntegrationSummary, INTEGRATION_WIZARD_STEPS } from "@/lib/integration-wizard/data-flow";
import { useIntegrationForm } from "@/lib/integration-wizard/use-integration-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/wizard/field-error";
import { WizardLayout } from "@/components/wizard/wizard-layout";
import { ConnectionPicker } from "@/components/integrations/connection-picker";
import { DataFlowPicker } from "@/components/integrations/data-flow-picker";
import type { Connection, Provider } from "@/types/domain";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface IntegrationWizardFormProps {
  tenantId: string;
  connections: Connection[];
  providers: Provider[];
}

export function IntegrationWizardForm({ tenantId, connections, providers }: IntegrationWizardFormProps) {
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSaveMessage, setDraftSaveMessage] = useState<string | null>(null);
  const [draftIntegrationId, setDraftIntegrationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDraftPending, startDraftTransition] = useTransition();

  const ctx = useIntegrationForm({ connections, providers });
  const {
    values,
    setValue,
    getValues,
    trigger,
    errors,
    sourceConn,
    destConn,
    sourceProvider,
    destProvider,
    selectedDataFlow,
    suggested,
    sourceOptions,
    providerMap,
    sourceDataFlows,
    destOptions,
    selectSource,
    selectDataFlow,
  } = ctx;

  const mappingTemplateCode = values.mappingProfileCode ?? suggested.mappingTemplateCode;

  const validateStep = async () => {
    if (step === 0) return trigger(["code", "name", "description", "tags", "owner"]);
    if (step === 1) return trigger(["triggerType"]);
    if (step === 2) return trigger(["sourceConnectionId"]);
    if (step === 3) return trigger(["dataFlowId"]);
    if (step === 4) return trigger(["destinationConnectionId"]);
    return true;
  };

  const handleNext = async () => {
    setSubmitError(null);
    setDraftSaveMessage(null);
    if (await validateStep()) setStep((s) => Math.min(s + 1, INTEGRATION_WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setDraftSaveMessage(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSaveDraft = () => {
    setSubmitError(null);
    setDraftSaveMessage(null);
    startDraftTransition(async () => {
      const result = await saveIntegrationDraftAction(tenantId, getValues(), draftIntegrationId ?? undefined);
      if (!result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors?.code) setStep(0);
        return;
      }
      setDraftIntegrationId(result.integrationId);
      setDraftSaveMessage("Draft saved. You can continue configuring this integration.");
    });
  };

  const handleSubmit = () => {
    setSubmitError(null);
    setDraftSaveMessage(null);
    startTransition(async () => {
      const result = await createIntegrationAction(tenantId, values, draftIntegrationId ?? undefined);
      if (result && !result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors?.code) setStep(0);
        else if (result.fieldErrors?.sourceConnectionId) setStep(2);
        else if (result.fieldErrors?.dataFlowId) setStep(3);
        else if (result.fieldErrors?.destinationConnectionId) setStep(4);
      }
    });
  };

  if (connections.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No connections available</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Create source and destination connections before adding an integration.</p>
          <Link href={`/tenants/${tenantId}/connections/new`} className="inline-flex text-sm font-medium text-link hover:underline">
            Create connection
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (sourceOptions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No source connections</AlertTitle>
        <AlertDescription>
          Create a read-capable connection (marketplace, SFTP, SAP, etc.) to use as an integration source.
        </AlertDescription>
      </Alert>
    );
  }

  const summary =
    selectedDataFlow && sourceConn && destConn && sourceProvider && destProvider
      ? buildIntegrationSummary({
          triggerType: values.triggerType,
          triggerConfig: values.triggerConfig,
          sourceName: sourceConn.name,
          sourceProviderName: sourceProvider.name,
          dataFlowName: selectedDataFlow.name,
          destinationName: destConn.name,
          destinationProviderName: destProvider.name,
          mappingTemplateCode,
        })
      : null;

  return (
    <WizardLayout
      title="Create integration"
      description="Define a source-driven integration flow for this tenant."
      steps={[...INTEGRATION_WIZARD_STEPS]}
      currentStep={step}
      cancelHref={`/tenants/${tenantId}/integrations`}
      onBack={handleBack}
      onNext={handleNext}
      isSubmitStep={step === INTEGRATION_WIZARD_STEPS.length - 1}
      onSubmit={handleSubmit}
      submitLabel="Create integration"
      isPending={isPending}
      onSaveDraft={handleSaveDraft}
      isSaveDraftPending={isDraftPending}
    >
      {draftSaveMessage && (
        <Alert className="mb-6 border-success-subtle/40 bg-success-subtle/20">
          <CheckCircle2 className="h-4 w-4 text-success-subtle-foreground" />
          <AlertTitle>Draft saved</AlertTitle>
          <AlertDescription>{draftSaveMessage}</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not create integration</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {step === 0 && <IntegrationGeneralSection ctx={ctx} tenantId={tenantId} />}

      {step === 1 && <IntegrationTriggerSection ctx={ctx} tenantId={tenantId} />}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground max-w-2xl">
            Select the source connection this integration will read data from.
          </p>
          <ConnectionPicker
            connections={sourceOptions}
            providerMap={providerMap}
            selectedId={values.sourceConnectionId}
            onSelect={selectSource}
            emptyMessage="No source-compatible connections available."
          />
          <FieldError message={errors.sourceConnectionId?.message} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Select Data Flow</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose what data this integration should extract from {sourceProvider?.name ?? "the selected source"}.
            </p>
          </div>
          <DataFlowPicker
            dataFlows={sourceDataFlows}
            selectedId={values.dataFlowId}
            onSelect={selectDataFlow}
            providerName={sourceProvider?.name ?? "Source"}
          />
          <FieldError message={errors.dataFlowId?.message} />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground max-w-2xl">
            {selectedDataFlow
              ? `Compatible destinations for ${selectedDataFlow.name}: ${selectedDataFlow.supportedDestinationCategories.join(", ")}`
              : "Select a destination connection."}
          </p>
          {destOptions.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-sm text-muted-foreground">
                No compatible destination connection found.
                <br />
                Create a compatible destination connection first.
              </p>
              <Link href={`/tenants/${tenantId}/connections/new`}>
                <Button type="button" variant="outline">Create destination connection</Button>
              </Link>
            </div>
          ) : (
            <ConnectionPicker
              connections={destOptions}
              providerMap={providerMap}
              selectedId={values.destinationConnectionId}
              onSelect={(id) => setValue("destinationConnectionId", id, { shouldValidate: true })}
              emptyMessage="No compatible destinations."
            />
          )}
          <FieldError message={errors.destinationConnectionId?.message} />
        </div>
      )}

      {step === 5 && selectedDataFlow && (
        <MappingStep
          sourceProvider={sourceProvider}
          sourceConnection={sourceConn}
          destinationProvider={destProvider}
          destinationConnection={destConn}
          dataFlow={selectedDataFlow}
          mappingProfileCode={values.mappingProfileCode}
          onMappingProfileCodeChange={(code) => setValue("mappingProfileCode", code)}
          idempotency={values.idempotency}
          onIdempotencyChange={(next) => setValue("idempotency", next, { shouldDirty: true })}
          idempotencyPreviewContext={{
            tenantId,
            integrationId: draftIntegrationId ?? (values.code || "draft"),
            dataFlowCode: selectedDataFlow.code,
          }}
        />
      )}

      {step === 6 && <IntegrationPolicySection ctx={ctx} />}

      {step === 7 && (
        <div className="space-y-6 max-w-3xl">
          {summary && (
            <div className="p-5 rounded-xl border border-primary/20 bg-primary-subtle/30 text-sm leading-relaxed">
              {summary}
            </div>
          )}
          <IntegrationProfilesSummary ctx={ctx} />
        </div>
      )}
    </WizardLayout>
  );
}
