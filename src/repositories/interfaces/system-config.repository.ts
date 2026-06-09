import type {
  DashboardMetrics,
  ExecutionPolicy,
  MappingProfile,
  PlatformSettings,
  ProviderUsageDataPoint,
  RetentionPolicy,
  RetryPolicy,
  RoutingProfile,
  StatusDistributionDataPoint,
  TransformationProfile,
  TrendDataPoint,
  ValidationProfile,
} from "@/types/domain";

export interface SystemConfigRepository {
  getValidationProfiles(): Promise<ValidationProfile[]>;
  getValidationProfileById(id: string): Promise<ValidationProfile | null>;
  getMappingProfiles(): Promise<MappingProfile[]>;
  getMappingProfileById(id: string): Promise<MappingProfile | null>;
  getTransformationProfiles(): Promise<TransformationProfile[]>;
  getTransformationProfileById(id: string): Promise<TransformationProfile | null>;
  getRoutingProfiles(): Promise<RoutingProfile[]>;
  getRoutingProfileById(id: string): Promise<RoutingProfile | null>;
  getExecutionPolicies(): Promise<ExecutionPolicy[]>;
  getExecutionPolicyById(id: string): Promise<ExecutionPolicy | null>;
  getRetryPolicies(): Promise<RetryPolicy[]>;
  getRetryPolicyById(id: string): Promise<RetryPolicy | null>;
  getRetentionPolicies(): Promise<RetentionPolicy[]>;
  getPlatformSettings(): Promise<PlatformSettings>;
}

export interface DashboardRepository {
  getMetrics(): Promise<DashboardMetrics>;
  getExecutionTrend(days?: number): Promise<TrendDataPoint[]>;
  getFailureTrend(days?: number): Promise<TrendDataPoint[]>;
  getDlqTrend(days?: number): Promise<TrendDataPoint[]>;
  getProviderUsage(): Promise<ProviderUsageDataPoint[]>;
  getStatusDistribution(): Promise<StatusDistributionDataPoint[]>;
}
