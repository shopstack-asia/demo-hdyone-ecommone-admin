/**
 * PostgreSQL Tenant Repository — Future Implementation
 *
 * This file serves as a placeholder for the PostgreSQL migration.
 * Implement TenantRepository interface using a PostgreSQL client (e.g., pg, Drizzle, Prisma).
 *
 * Migration steps:
 * 1. npm install pg (or preferred ORM)
 * 2. Implement all methods against tenant table
 * 3. Swap in repositories/index.ts
 *
 * Example:
 *
 * export class PostgresTenantRepository implements TenantRepository {
 *   constructor(private readonly db: Pool) {}
 *
 *   async findAll(filter?: TenantFilter): Promise<PaginatedResult<Tenant>> {
 *     const { rows } = await this.db.query(
 *       'SELECT * FROM tenants WHERE status = $1 LIMIT $2 OFFSET $3',
 *       [filter?.status, filter?.pageSize, offset]
 *     );
 *     return { data: rows, total, page, pageSize, totalPages };
 *   }
 *   // ...
 * }
 */

export {};
