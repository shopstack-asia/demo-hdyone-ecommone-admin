import type { ConfigSchemaField } from "@/types/domain";
import { z } from "zod";

export const createConnectionSchema = z.object({
  providerId: z.string().min(1, "Select a provider"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  configuration: z.record(z.string(), z.string()),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;

export const updateConnectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  configuration: z.record(z.string(), z.string()),
});

export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;

export function validateProviderConfig(
  fields: ConfigSchemaField[],
  config: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = (config[field.key] ?? "").trim();

    if (field.required && !value) {
      errors[field.key] = `${field.label} is required`;
      continue;
    }

    if (!value) continue;

    if (field.type === "url") {
      try {
        new URL(value);
      } catch {
        errors[field.key] = "Enter a valid URL (include https://)";
      }
    }

    if (field.type === "number" && Number.isNaN(Number(value))) {
      errors[field.key] = "Enter a valid number";
    }
  }

  return errors;
}
