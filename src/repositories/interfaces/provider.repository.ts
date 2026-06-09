import type { Provider } from "@/types/domain";
import type { PaginatedResult, PaginationParams, SortParams } from "@/types/query";

export interface ProviderFilter extends PaginationParams, SortParams {
  search?: string;
  category?: string;
}

export interface ProviderRepository {
  findAll(filter?: ProviderFilter): Promise<PaginatedResult<Provider>>;
  findById(id: string): Promise<Provider | null>;
  findByCode(code: string): Promise<Provider | null>;
}
