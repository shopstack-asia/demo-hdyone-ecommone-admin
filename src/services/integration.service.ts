import { repositories } from "@/repositories";
import type { Integration } from "@/types/domain";
import type { IntegrationFilter } from "@/types/query";

export class IntegrationService {
  async listIntegrations(filter: IntegrationFilter) {
    return repositories.integration.findAll(filter);
  }

  async getIntegration(id: string) {
    return repositories.integration.findById(id);
  }

  async getIntegrationsByTenant(tenantId: string) {
    return repositories.integration.findByTenantId(tenantId);
  }

  async createIntegration(data: Omit<Integration, "id" | "createdAt" | "updatedAt">) {
    return repositories.integration.create(data);
  }

  async updateIntegration(id: string, data: Partial<Integration>) {
    return repositories.integration.update(id, data);
  }
}

export const integrationService = new IntegrationService();
