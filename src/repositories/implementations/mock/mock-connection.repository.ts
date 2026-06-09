import { getMockDatabase } from "@/data/mock-database";
import type { ConnectionRepository } from "@/repositories/interfaces/connection.repository";
import { paginate, searchFilter } from "@/repositories/utils/pagination";
import type { Connection } from "@/types/domain";
import type { ConnectionFilter } from "@/types/query";

export class MockConnectionRepository implements ConnectionRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: ConnectionFilter) {
    let items = this.db.connections.filter((c) => c.tenantId === filter.tenantId);
    items = searchFilter(items, filter.search, ["name"]);
    if (filter.status) items = items.filter((c) => c.status === filter.status);
    if (filter.providerId) items = items.filter((c) => c.providerId === filter.providerId);
    return paginate(items, filter, (a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return this.db.connections.find((c) => c.id === id) ?? null;
  }

  async findByTenantId(tenantId: string) {
    return this.db.connections.filter((c) => c.tenantId === tenantId);
  }

  async create(data: Omit<Connection, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const connection: Connection = {
      ...data,
      id: `CON-${String(this.db.connections.length + 1).padStart(6, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.connections.push(connection);
    return connection;
  }

  async update(id: string, data: Partial<Connection>) {
    const idx = this.db.connections.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.db.connections[idx] = { ...this.db.connections[idx], ...data, updatedAt: new Date() };
    return this.db.connections[idx];
  }

  async delete(id: string) {
    const idx = this.db.connections.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.db.connections.splice(idx, 1);
    return true;
  }
}

export const mockConnectionRepository = new MockConnectionRepository();
