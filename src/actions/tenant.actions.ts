"use server";

import { CURRENT_PLATFORM_USER_ID } from "@/lib/current-user";
import { createTenantSchema, type CreateTenantInput } from "@/lib/schemas/tenant.schema";
import { platformUserService, tenantService } from "@/services";
import { TenantStatus } from "@/types/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateTenantResult = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createTenantAction(
  input: CreateTenantInput
): Promise<CreateTenantResult | void> {
  const parsed = createTenantSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed. Check the form and try again.";
    return { success: false, error: firstError, fieldErrors };
  }

  const data = parsed.data;

  if (!data.assignedUserIds.includes(CURRENT_PLATFORM_USER_ID)) {
    return {
      success: false,
      error: "The tenant creator must remain assigned to this tenant.",
      fieldErrors: { assignedUserIds: ["Creator cannot be removed"] },
    };
  }

  const existing = await tenantService.findByCode(data.code.toUpperCase());
  if (existing) {
    return {
      success: false,
      error: `Tenant code "${data.code}" is already in use.`,
      fieldErrors: { code: ["This code is already in use"] },
    };
  }

  const tenant = await tenantService.createTenant({
    code: data.code.toUpperCase(),
    name: data.name,
    country: data.country,
    timezone: data.timezone,
    description: data.description || undefined,
    status: TenantStatus.PENDING,
  });

  await Promise.all(
    data.assignedUserIds.map(async (userId) => {
      const user = await platformUserService.getUser(userId);
      if (!user || user.allTenantsAccess || user.tenantIds.includes(tenant.id)) return;
      await platformUserService.updateUser(userId, {
        tenantIds: [...user.tenantIds, tenant.id],
      });
    })
  );

  revalidatePath("/tenants");
  revalidatePath("/system-config");
  redirect(`/tenants/${tenant.id}/overview`);
}
