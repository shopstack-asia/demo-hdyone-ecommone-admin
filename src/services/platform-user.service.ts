import { repositories } from "@/repositories";
import type { PlatformUser } from "@/types/domain";
import type { PlatformUserFilter } from "@/types/query";

export class PlatformUserService {
  async listUsers(filter?: PlatformUserFilter) {
    return repositories.platformUser.findAll(filter);
  }

  async getUser(id: string) {
    return repositories.platformUser.findById(id);
  }

  async createUser(data: Omit<PlatformUser, "id" | "createdAt" | "updatedAt">) {
    return repositories.platformUser.create(data);
  }

  async updateUser(id: string, data: Partial<PlatformUser>) {
    return repositories.platformUser.update(id, data);
  }
}

export const platformUserService = new PlatformUserService();
