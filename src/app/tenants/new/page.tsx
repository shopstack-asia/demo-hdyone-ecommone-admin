import { AppShell } from "@/components/layout/app-shell";
import { CreateTenantForm } from "@/components/tenants/create-tenant-form";
import { CURRENT_PLATFORM_USER_ID } from "@/lib/current-user";
import { platformUserService } from "@/services";
import { notFound } from "next/navigation";

export default async function NewTenantPage() {
  const [{ data: platformUsers }, creatorById] = await Promise.all([
    platformUserService.listUsers({ pageSize: 100 }),
    platformUserService.getUser(CURRENT_PLATFORM_USER_ID),
  ]);

  const creator =
    creatorById ??
    platformUsers.find((u) => u.email === "admin@commerceone.io") ??
    platformUsers[0];

  if (!creator) notFound();

  return (
    <AppShell>
      <CreateTenantForm platformUsers={platformUsers} creatorUserId={creator.id} />
    </AppShell>
  );
}
