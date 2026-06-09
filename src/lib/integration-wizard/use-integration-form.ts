"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIntegrationSchema, type CreateIntegrationInput } from "@/lib/schemas/integration.schema";
import {
  filterConnectionsForDataFlow,
  getSourceDataFlows,
  getSuggestedProfiles,
} from "@/lib/integration-wizard/data-flow";
import { integrationToFormValues, createEmptyFormValues } from "@/lib/integration-wizard/form-values";
import { findDataFlowById } from "@/data/provider-data-flows";
import { filterConnectionsForSource } from "@/lib/provider-capabilities";
import type { Connection, Integration, Provider } from "@/types/domain";
import { ProviderCategory, TriggerType } from "@/types/enums";

interface UseIntegrationFormOptions {
  connections: Connection[];
  providers: Provider[];
  integration?: Integration;
  mappingProfileCode?: string;
}

export function useIntegrationForm({
  connections,
  providers,
  integration,
  mappingProfileCode: initialMappingProfileCode,
}: UseIntegrationFormOptions) {
  const providerMap = useMemo(() => new Map(providers.map((p) => [p.id, p])), [providers]);
  const sourceOptions = useMemo(
    () => filterConnectionsForSource(connections, providerMap),
    [connections, providerMap]
  );

  const defaultValues = useMemo(
    () =>
      integration
        ? integrationToFormValues(integration, initialMappingProfileCode)
        : createEmptyFormValues(),
    [integration, initialMappingProfileCode]
  );

  const form = useForm<CreateIntegrationInput>({
    resolver: zodResolver(createIntegrationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const values = watch();

  const sourceConn = connections.find((c) => c.id === values.sourceConnectionId);
  const destConn = connections.find((c) => c.id === values.destinationConnectionId);
  const sourceProvider = sourceConn ? providerMap.get(sourceConn.providerId) : undefined;
  const destProvider = destConn ? providerMap.get(destConn.providerId) : undefined;
  const sourceDataFlows = getSourceDataFlows(sourceProvider);
  const selectedDataFlow =
    sourceDataFlows.find((f) => f.id === values.dataFlowId) ??
    findDataFlowById(providers, values.dataFlowId);
  const destOptions = filterConnectionsForDataFlow(connections, providerMap, selectedDataFlow);
  const suggested = getSuggestedProfiles(selectedDataFlow);
  const isFileSource = sourceProvider?.category === ProviderCategory.STORAGE;

  const selectSource = (id: string) => {
    setValue("sourceConnectionId", id, { shouldValidate: true });
    setValue("dataFlowId", "");
    setValue("destinationConnectionId", "");
    const provider = providerMap.get(connections.find((c) => c.id === id)?.providerId ?? "");
    const flows = getSourceDataFlows(provider);
    if (flows.length === 1) setValue("dataFlowId", flows[0].id);
  };

  const selectDataFlow = (id: string) => {
    setValue("dataFlowId", id, { shouldValidate: true });
    setValue("destinationConnectionId", "");
    const flow = sourceDataFlows.find((f) => f.id === id);
    if (flow && !flow.supportedTriggers.includes(values.triggerType)) {
      setValue("triggerType", flow.recommendedTrigger, { shouldValidate: true });
    }
  };

  const triggerOptions = [
    { type: TriggerType.SCHEDULE, label: "Schedule", description: "Run on a cron schedule." },
    { type: TriggerType.WEBHOOK, label: "Webhook", description: "Trigger on inbound HTTP events." },
    { type: TriggerType.API, label: "API", description: "Trigger via REST API call." },
  ] as const;

  return {
    form,
    register,
    watch,
    setValue,
    getValues,
    trigger,
    errors,
    values,
    providerMap,
    sourceOptions,
    sourceConn,
    destConn,
    sourceProvider,
    destProvider,
    sourceDataFlows,
    selectedDataFlow,
    destOptions,
    suggested,
    isFileSource,
    selectSource,
    selectDataFlow,
    triggerOptions,
  };
}

export type IntegrationFormContext = ReturnType<typeof useIntegrationForm>;
