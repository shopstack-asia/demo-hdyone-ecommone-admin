import { describe, it, expect } from "vitest";
import {
  createConnectionSchema,
  validateProviderConfig,
} from "@/lib/schemas/connection.schema";
import type { ConfigSchemaField } from "@/types/domain";

describe("createConnectionSchema", () => {
  const valid = {
    providerId: "PRV-000001",
    name: "Shopee Production",
    configuration: { partnerId: "123", partnerKey: "secret", shopId: "456", region: "TH" },
  };

  it("accepts valid input", () => {
    expect(createConnectionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing provider", () => {
    const result = createConnectionSchema.safeParse({ ...valid, providerId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = createConnectionSchema.safeParse({ ...valid, name: "a" });
    expect(result.success).toBe(false);
  });
});

describe("validateProviderConfig", () => {
  const fields: ConfigSchemaField[] = [
    { key: "host", label: "Host", type: "url", required: true },
    { key: "port", label: "Port", type: "number", required: true },
    { key: "notes", label: "Notes", type: "text", required: false },
  ];

  it("flags missing required fields", () => {
    const errors = validateProviderConfig(fields, { port: "22" });
    expect(errors.host).toBeDefined();
  });

  it("validates URL format", () => {
    const errors = validateProviderConfig(fields, {
      host: "not-a-url",
      port: "22",
    });
    expect(errors.host).toContain("valid URL");
  });

  it("validates number format", () => {
    const errors = validateProviderConfig(fields, {
      host: "https://example.com",
      port: "abc",
    });
    expect(errors.port).toContain("valid number");
  });

  it("passes valid configuration", () => {
    const errors = validateProviderConfig(fields, {
      host: "https://example.com",
      port: "22",
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});
