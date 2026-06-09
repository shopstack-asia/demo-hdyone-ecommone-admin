import { getMockDatabase } from "@/data/mock-database";
import type { IntegrationRepository } from "@/repositories/interfaces/integration.repository";
import { paginate, searchFilter } from "@/repositories/utils/pagination";
import type { Integration } from "@/types/domain";
import type { IntegrationFilter } from "@/types/query";

function integrationNumericKey(value: string): string | null {
  const match = value.toUpperCase().match(/^INT-0*(\d+)$/);
  return match?.[1] ?? null;
}

export class MockIntegrationRepository implements IntegrationRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: IntegrationFilter) {
    let items = this.db.integrations.filter((i) => i.tenantId === filter.tenantId);
    items = searchFilter(items, filter.search, ["code", "name"]);
    if (filter.status) items = items.filter((i) => i.status === filter.status);
    if (filter.triggerType) items = items.filter((i) => i.triggerType === filter.triggerType);
    return paginate(items, filter, (a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return this.db.integrations.find((i) => i.id === id) ?? null;
  }

  async findByCode(code: string) {
    const normalized = code.toUpperCase();
    return this.db.integrations.find((i) => i.code.toUpperCase() === normalized) ?? null;
  }

  async resolveForTenant(tenantId: string, key: string) {
    const tenantIntegrations = this.db.integrations.filter((i) => i.tenantId === tenantId);
    const normalized = key.toUpperCase();
    const keyNumber = integrationNumericKey(normalized);

    const direct = tenantIntegrations.find(
      (i) => i.id === key || i.code.toUpperCase() === normalized
    );
    if (direct) return direct;

    if (keyNumber) {
      const legacy = tenantIntegrations.find((i) => integrationNumericKey(i.id) === keyNumber);
      if (legacy) return legacy;
    }

    return null;
  }

  async resolveByKey(key: string) {
    const normalized = key.toUpperCase();
    const keyNumber = integrationNumericKey(normalized);

    const direct = this.db.integrations.find(
      (i) => i.id === key || i.code.toUpperCase() === normalized
    );
    if (direct) return direct;

    if (keyNumber) {
      const legacy = this.db.integrations.find((i) => integrationNumericKey(i.id) === keyNumber);
      if (legacy) return legacy;
    }

    return null;
  }

  async findByTenantId(tenantId: string) {
    return this.db.integrations.filter((i) => i.tenantId === tenantId);
  }

  async create(data: Omit<Integration, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const integration: Integration = {
      ...data,
      id: data.code.toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };
    this.db.integrations.push(integration);
    return integration;
  }

  async update(id: string, data: Partial<Integration>) {
    const idx = this.db.integrations.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.db.integrations[idx] = { ...this.db.integrations[idx], ...data, updatedAt: new Date() };
    return this.db.integrations[idx];
  }

  async delete(id: string) {
    const idx = this.db.integrations.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.db.integrations.splice(idx, 1);
    return true;
  }
}

export const mockIntegrationRepository = new MockIntegrationRepository();
