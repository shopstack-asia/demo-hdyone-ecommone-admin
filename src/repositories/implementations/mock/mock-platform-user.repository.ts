import { getMockDatabase } from "@/data/mock-database";
import type { PlatformUserRepository } from "@/repositories/interfaces/platform-user.repository";
import { paginate, searchFilter } from "@/repositories/utils/pagination";
import type { PlatformUser } from "@/types/domain";
import type { PlatformUserFilter } from "@/types/query";

export class MockPlatformUserRepository implements PlatformUserRepository {
  private get db() {
    return getMockDatabase();
  }

  async findAll(filter: PlatformUserFilter = {}) {
    let items = [...this.db.platformUsers];
    items = searchFilter(items, filter.search, ["name", "email"]);
    if (filter.status) items = items.filter((u) => u.status === filter.status);
    if (filter.role) items = items.filter((u) => u.role === filter.role);
    return paginate(items, filter, (a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return this.db.platformUsers.find((u) => u.id === id) ?? null;
  }

  async create(data: Omit<PlatformUser, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const user: PlatformUser = {
      ...data,
      id: `USR-${String(this.db.platformUsers.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.platformUsers.push(user);
    return user;
  }

  async update(id: string, data: Partial<PlatformUser>) {
    const index = this.db.platformUsers.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const updated: PlatformUser = {
      ...this.db.platformUsers[index],
      ...data,
      updatedAt: new Date(),
    };
    this.db.platformUsers[index] = updated;
    return updated;
  }
}

export const mockPlatformUserRepository = new MockPlatformUserRepository();
