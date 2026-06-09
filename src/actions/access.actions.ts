"use server";

import { platformUserService } from "@/services";
import { PlatformUserRole, PlatformUserStatus } from "@/types/enums";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type AccessActionResult =
  | { success: true }
  | { success: false; error: string };

const updatePlatformUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email."),
  role: z.nativeEnum(PlatformUserRole),
  status: z.nativeEnum(PlatformUserStatus),
  allTenantsAccess: z.boolean(),
  tenantIds: z.array(z.string()),
});

const createPlatformUserSchema = updatePlatformUserSchema;

function normalizeTenantAccess(
  role: PlatformUserRole,
  allTenantsAccess: boolean,
  tenantIds: string[]
) {
  if (role === PlatformUserRole.PLATFORM_ADMIN) {
    return { allTenantsAccess: true, tenantIds: [] as string[] };
  }
  return { allTenantsAccess: false, tenantIds };
}

export async function updatePlatformUserAction(
  userId: string,
  input: z.infer<typeof updatePlatformUserSchema>
): Promise<AccessActionResult> {
  const parsed = updatePlatformUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid user data." };
  }

  const data = parsed.data;
  const user = await platformUserService.getUser(userId);
  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (data.role !== PlatformUserRole.PLATFORM_ADMIN && data.tenantIds.length === 0) {
    return { success: false, error: "Assign at least one tenant for non-admin users." };
  }

  const tenantAccess = normalizeTenantAccess(data.role, data.allTenantsAccess, data.tenantIds);
  const updated = await platformUserService.updateUser(userId, {
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    ...tenantAccess,
  });

  if (!updated) {
    return { success: false, error: "Could not update user." };
  }

  revalidatePath("/system-config");
  return { success: true };
}

export async function createPlatformUserAction(
  input: z.infer<typeof createPlatformUserSchema>
): Promise<AccessActionResult> {
  const parsed = createPlatformUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid user data." };
  }

  const data = parsed.data;
  const { data: existing } = await platformUserService.listUsers({ pageSize: 500 });
  if (existing.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: "A user with this email already exists." };
  }

  if (data.role !== PlatformUserRole.PLATFORM_ADMIN && data.tenantIds.length === 0) {
    return { success: false, error: "Assign at least one tenant for non-admin users." };
  }

  const tenantAccess = normalizeTenantAccess(data.role, data.allTenantsAccess, data.tenantIds);
  await platformUserService.createUser({
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    ...tenantAccess,
  });

  revalidatePath("/system-config");
  return { success: true };
}
