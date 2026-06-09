import type { Connection } from "@/types/domain";
import type { ConnectionFilter, PaginatedResult } from "@/types/query";

export interface ConnectionRepository {
  findAll(filter: ConnectionFilter): Promise<PaginatedResult<Connection>>;
  findById(id: string): Promise<Connection | null>;
  findByTenantId(tenantId: string): Promise<Connection[]>;
  create(connection: Omit<Connection, "id" | "createdAt" | "updatedAt">): Promise<Connection>;
  update(id: string, data: Partial<Connection>): Promise<Connection | null>;
  delete(id: string): Promise<boolean>;
}
