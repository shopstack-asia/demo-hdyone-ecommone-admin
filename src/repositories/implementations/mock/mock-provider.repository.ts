import { getMockDatabase } from "@/data/mock-database";
import type { ProviderRepository, ProviderFilter } from "@/repositories/interfaces/provider.repository";
import { paginate, searchFilter } from "@/repositories/utils/pagination";

export class MockProviderRepository implements ProviderRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: ProviderFilter = {}) {
    let items = [...this.db.providers];
    items = searchFilter(items, filter.search, ["code", "name"]);
    if (filter.category) items = items.filter((p) => p.category === filter.category);
    return paginate(items, filter, (a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return this.db.providers.find((p) => p.id === id) ?? null;
  }

  async findByCode(code: string) {
    return this.db.providers.find((p) => p.code === code) ?? null;
  }
}

export const mockProviderRepository = new MockProviderRepository();
