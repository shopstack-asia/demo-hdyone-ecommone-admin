import type { PlatformUser } from "@/types/domain";
import type { PlatformUserFilter, PaginatedResult } from "@/types/query";

export interface PlatformUserRepository {
  findAll(filter?: PlatformUserFilter): Promise<PaginatedResult<PlatformUser>>;
  findById(id: string): Promise<PlatformUser | null>;
  create(data: Omit<PlatformUser, "id" | "createdAt" | "updatedAt">): Promise<PlatformUser>;
  update(id: string, data: Partial<PlatformUser>): Promise<PlatformUser | null>;
}
