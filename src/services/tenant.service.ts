import { repositories } from "@/repositories";
import type { Tenant } from "@/types/domain";
import type { TenantFilter } from "@/types/query";

export class TenantService {
  async listTenants(filter?: TenantFilter) {
    return repositories.tenant.findAll(filter);
  }

  async getTenant(id: string) {
    return repositories.tenant.findById(id);
  }

  async findByCode(code: string) {
    return repositories.tenant.findByCode(code);
  }

  async getTenantStats(id: string) {
    return repositories.tenant.getStats(id);
  }

  async createTenant(data: Omit<Tenant, "id" | "createdAt" | "updatedAt">) {
    return repositories.tenant.create(data);
  }

  async updateTenant(id: string, data: Partial<Tenant>) {
    return repositories.tenant.update(id, data);
  }

  async deleteTenant(id: string) {
    return repositories.tenant.delete(id);
  }
}

export const tenantService = new TenantService();
