import { z } from "zod";

export const TENANT_COUNTRIES = [
  { name: "Thailand", timezone: "Asia/Bangkok" },
  { name: "Singapore", timezone: "Asia/Singapore" },
  { name: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
  { name: "Indonesia", timezone: "Asia/Jakarta" },
  { name: "Philippines", timezone: "Asia/Manila" },
  { name: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
] as const;

const countryNames = TENANT_COUNTRIES.map((c) => c.name) as [string, ...string[]];
const timezones = [...new Set(TENANT_COUNTRIES.map((c) => c.timezone))] as [string, ...string[]];

export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tenant name must be at least 2 characters")
    .max(120, "Tenant name must be at most 120 characters"),
  code: z
    .string()
    .trim()
    .min(3, "Tenant code must be at least 3 characters")
    .max(12, "Tenant code must be at most 12 characters")
    .regex(
      /^[A-Z][A-Z0-9-]*$/,
      "Code must start with a letter and contain only uppercase letters, numbers, and hyphens"
    ),
  country: z
    .union([z.enum(countryNames), z.literal("")])
    .refine((value): value is (typeof countryNames)[number] => value !== "", {
      message: "Select a country",
    }),
  timezone: z
    .union([z.enum(timezones), z.literal("")])
    .refine((value): value is (typeof timezones)[number] => value !== "", {
      message: "Select a timezone",
    }),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  assignedUserIds: z
    .array(z.string().min(1))
    .min(1, "Assign at least one user to manage this tenant"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
