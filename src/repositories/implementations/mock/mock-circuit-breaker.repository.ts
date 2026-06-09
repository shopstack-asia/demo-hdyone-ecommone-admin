import { getMockDatabase } from "@/data/mock-database";
import type { CircuitBreakerRepository } from "@/repositories/interfaces/circuit-breaker.repository";
import { paginate } from "@/repositories/utils/pagination";
import { CircuitBreakerState } from "@/types/enums";
import type { CircuitBreakerFilter } from "@/types/query";

export class MockCircuitBreakerRepository implements CircuitBreakerRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: CircuitBreakerFilter = {}) {
    let items = [...this.db.circuitBreakers];
    if (filter.tenantId) items = items.filter((c) => c.tenantId === filter.tenantId);
    if (filter.state) items = items.filter((c) => c.state === filter.state);
    return paginate(items, filter);
  }

  async findById(id: string) {
    return this.db.circuitBreakers.find((c) => c.id === id) ?? null;
  }

  async findByTenantId(tenantId: string) {
    return this.db.circuitBreakers.filter((c) => c.tenantId === tenantId);
  }

  async countOpen() {
    return this.db.circuitBreakers.filter((c) => c.state === CircuitBreakerState.OPEN).length;
  }
}

export const mockCircuitBreakerRepository = new MockCircuitBreakerRepository();
