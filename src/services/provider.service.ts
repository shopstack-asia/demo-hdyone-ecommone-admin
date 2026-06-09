import { repositories } from "@/repositories";
import type { ProviderFilter } from "@/repositories/interfaces/provider.repository";

export class ProviderService {
  async listProviders(filter?: ProviderFilter) {
    return repositories.provider.findAll(filter);
  }

  async getProvider(id: string) {
    return repositories.provider.findById(id);
  }

  async getProviderByCode(code: string) {
    return repositories.provider.findByCode(code);
  }
}

export const providerService = new ProviderService();
