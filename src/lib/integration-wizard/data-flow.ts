import type { Connection, Provider, ProviderDataFlow } from "@/types/domain";
import { ProviderCategory } from "@/types/enums";
import { filterConnectionsForDestination } from "@/lib/provider-capabilities";

export const INTEGRATION_WIZARD_STEPS = [
  "General",
  "Trigger",
  "Source",
  "Data Flow",
  "Destination",
  "Mapping",
  "Policy",
  "Review",
] as const;

const DESTINATION_CATEGORY_MAP: Record<string, ProviderCategory[]> = {
  ERP: [ProviderCategory.ERP],
  OMS: [ProviderCategory.ERP, ProviderCategory.CUSTOM],
  API: [ProviderCategory.PROTOCOL],
  QUEUE: [ProviderCategory.PROTOCOL, ProviderCategory.CUSTOM],
  PIM: [ProviderCategory.CUSTOM, ProviderCategory.ERP],
  WMS: [ProviderCategory.WMS, ProviderCategory.STORAGE],
  CRM: [ProviderCategory.CRM, ProviderCategory.ERP],
  DATA_WAREHOUSE: [ProviderCategory.CUSTOM],
  CUSTOM: [ProviderCategory.CUSTOM],
};

export function getSourceDataFlows(provider: Provider | undefined): ProviderDataFlow[] {
  if (!provider) return [];
  return provider.dataFlows.filter((f) => f.direction === "SOURCE" || f.direction === "BOTH");
}

export function filterConnectionsForDataFlow(
  connections: Connection[],
  providerMap: Map<string, Provider>,
  dataFlow: ProviderDataFlow | undefined
): Connection[] {
  if (!dataFlow) return [];

  const allowedCategories = new Set<ProviderCategory>();
  for (const cat of dataFlow.supportedDestinationCategories) {
    for (const mapped of DESTINATION_CATEGORY_MAP[cat.toUpperCase()] ?? [ProviderCategory.CUSTOM]) {
      allowedCategories.add(mapped);
    }
  }

  const writeCapable = filterConnectionsForDestination(connections, providerMap);
  return writeCapable.filter((c) => {
    const provider = providerMap.get(c.providerId);
    return provider && allowedCategories.has(provider.category);
  });
}

export interface SuggestedProfiles {
  mappingTemplateCode: string;
  validationProfileCode: string;
  transformationProfileCode: string;
  routingProfileCode: string;
  executionPolicyCode: string;
  retryPolicyCode: string;
}

export function getSuggestedProfiles(dataFlow: ProviderDataFlow | undefined): SuggestedProfiles {
  return {
    mappingTemplateCode: dataFlow?.defaultMappingTemplateCode ?? "GENERIC_MAPPING",
    validationProfileCode: dataFlow?.defaultValidationProfileCode ?? "GENERIC_VALIDATION",
    transformationProfileCode: dataFlow?.defaultTransformationProfileCode ?? "GENERIC_TRANSFORM",
    routingProfileCode: dataFlow?.defaultRoutingProfileCode ?? "STANDARD_ROUTE",
    executionPolicyCode: dataFlow?.defaultExecutionPolicyCode ?? "STANDARD_EXECUTION",
    retryPolicyCode: dataFlow?.defaultRetryPolicyCode ?? "STANDARD_RETRY",
  };
}

export function buildIntegrationSummary(params: {
  triggerType: string;
  triggerConfig?: Record<string, unknown>;
  sourceName: string;
  sourceProviderName: string;
  dataFlowName: string;
  destinationName: string;
  destinationProviderName: string;
  mappingTemplateCode: string;
}): string {
  const schedule =
    params.triggerType === "SCHEDULE"
      ? (params.triggerConfig?.cron as string | undefined) ?? "every 15 minutes"
      : params.triggerType.toLowerCase();

  const triggerPhrase =
    params.triggerType === "SCHEDULE"
      ? `run on schedule (${schedule})`
      : params.triggerType === "WEBHOOK"
        ? "trigger on inbound webhook events"
        : "trigger via API on demand";

  return `This integration will ${triggerPhrase} and extract ${params.dataFlowName} from ${params.sourceProviderName} (${params.sourceName}), transform them using the ${params.mappingTemplateCode} mapping profile, and deliver them to ${params.destinationProviderName} (${params.destinationName}).`;
}
