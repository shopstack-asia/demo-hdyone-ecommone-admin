import { repositories } from "@/repositories";
import type { Connection } from "@/types/domain";
import type { ConnectionFilter } from "@/types/query";

export class ConnectionService {
  async listConnections(filter: ConnectionFilter) {
    return repositories.connection.findAll(filter);
  }

  async getConnection(id: string) {
    return repositories.connection.findById(id);
  }

  async getConnectionsByTenant(tenantId: string) {
    return repositories.connection.findByTenantId(tenantId);
  }

  async createConnection(data: Omit<Connection, "id" | "createdAt" | "updatedAt">) {
    return repositories.connection.create(data);
  }

  async updateConnection(id: string, data: Partial<Connection>) {
    return repositories.connection.update(id, data);
  }

  async deleteConnection(id: string) {
    return repositories.connection.delete(id);
  }
}

export const connectionService = new ConnectionService();
