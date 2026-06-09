import { repositories } from "@/repositories";

export class SystemConfigService {
  async getValidationProfiles() {
    return repositories.systemConfig.getValidationProfiles();
  }

  async getValidationProfile(id: string) {
    return repositories.systemConfig.getValidationProfileById(id);
  }

  async getMappingProfiles() {
    return repositories.systemConfig.getMappingProfiles();
  }

  async getMappingProfile(id: string) {
    return repositories.systemConfig.getMappingProfileById(id);
  }

  async getTransformationProfiles() {
    return repositories.systemConfig.getTransformationProfiles();
  }

  async getTransformationProfile(id: string) {
    return repositories.systemConfig.getTransformationProfileById(id);
  }

  async getRoutingProfiles() {
    return repositories.systemConfig.getRoutingProfiles();
  }

  async getRoutingProfile(id: string) {
    return repositories.systemConfig.getRoutingProfileById(id);
  }

  async getExecutionPolicies() {
    return repositories.systemConfig.getExecutionPolicies();
  }

  async getExecutionPolicy(id: string) {
    return repositories.systemConfig.getExecutionPolicyById(id);
  }

  async getRetryPolicies() {
    return repositories.systemConfig.getRetryPolicies();
  }

  async getRetryPolicy(id: string) {
    return repositories.systemConfig.getRetryPolicyById(id);
  }

  async getRetentionPolicies() {
    return repositories.systemConfig.getRetentionPolicies();
  }

  async getPlatformSettings() {
    return repositories.systemConfig.getPlatformSettings();
  }
}

export const systemConfigService = new SystemConfigService();
