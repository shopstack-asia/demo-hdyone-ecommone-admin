import { describe, it, expect } from "vitest";
import { createTenantSchema } from "@/lib/schemas/tenant.schema";

describe("createTenantSchema", () => {
  const valid = {
    name: "Brand Alpha",
    code: "BR001",
    country: "Thailand" as const,
    timezone: "Asia/Bangkok" as const,
    description: "",
    assignedUserIds: ["USR-000001"],
  };

  it("accepts valid input", () => {
    expect(createTenantSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid code format", () => {
    const result = createTenantSchema.safeParse({ ...valid, code: "lowercase" });
    expect(result.success).toBe(false);
  });

  it("rejects empty assigned users", () => {
    const result = createTenantSchema.safeParse({ ...valid, assignedUserIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects short tenant name", () => {
    const result = createTenantSchema.safeParse({ ...valid, name: "a" });
    expect(result.success).toBe(false);
  });
});
