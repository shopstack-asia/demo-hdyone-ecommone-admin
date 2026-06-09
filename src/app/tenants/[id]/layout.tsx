import { notFound } from "next/navigation";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { id } = await params;
  const { tenantService } = await import("@/services");
  const tenant = await tenantService.getTenant(id);
  if (!tenant) notFound();

  const { TenantHeader } = await import("@/components/tenants/tenant-header");
  const { AppShell } = await import("@/components/layout/app-shell");

  return (
    <AppShell>
      <TenantHeader tenant={tenant} />
      {children}
    </AppShell>
  );
}
