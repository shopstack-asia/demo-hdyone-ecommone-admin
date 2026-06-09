import type {
  ExecutionPolicy,
  MappingProfile,
  ProviderDataFlow,
  RetryPolicy,
  RoutingProfile,
  TransformationProfile,
  ValidationProfile,
} from "@/types/domain";

type ProfileLists = {
  validationProfiles: ValidationProfile[];
  mappingProfiles: MappingProfile[];
  transformationProfiles: TransformationProfile[];
  routingProfiles: RoutingProfile[];
  executionPolicies: ExecutionPolicy[];
  retryPolicies: RetryPolicy[];
};

function findByCode<T extends { code: string; id: string }>(list: T[], code: string | undefined, fallback: T): string {
  if (!code) return fallback.id;
  return list.find((p) => p.code === code)?.id ?? fallback.id;
}

export function resolveProfileIdsFromDataFlow(
  dataFlow: ProviderDataFlow,
  profiles: ProfileLists,
  overrides?: {
    mappingProfileCode?: string;
    validationProfileCode?: string;
  }
) {
  return {
    validationProfileId: findByCode(
      profiles.validationProfiles,
      overrides?.validationProfileCode ?? dataFlow.defaultValidationProfileCode,
      profiles.validationProfiles[0]
    ),
    mappingProfileId: findByCode(
      profiles.mappingProfiles,
      overrides?.mappingProfileCode ?? dataFlow.defaultMappingTemplateCode,
      profiles.mappingProfiles[0]
    ),
    transformationProfileId: findByCode(
      profiles.transformationProfiles,
      dataFlow.defaultTransformationProfileCode,
      profiles.transformationProfiles[0]
    ),
    routingProfileId: findByCode(
      profiles.routingProfiles,
      dataFlow.defaultRoutingProfileCode,
      profiles.routingProfiles[0]
    ),
    executionPolicyId: findByCode(
      profiles.executionPolicies,
      dataFlow.defaultExecutionPolicyCode,
      profiles.executionPolicies[0]
    ),
    retryPolicyId: findByCode(
      profiles.retryPolicies,
      dataFlow.defaultRetryPolicyCode,
      profiles.retryPolicies[0]
    ),
  };
}
