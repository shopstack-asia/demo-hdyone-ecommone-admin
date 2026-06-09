import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { SystemConfigTabs } from "@/components/system-config/system-config-tabs";
import { platformUserService, providerService, systemConfigService, tenantService } from "@/services";

export default async function SystemConfigPage() {
  const [{ data: providers }, platformSettings, { data: users }, { data: tenants }] = await Promise.all([
    providerService.listProviders({ pageSize: 100 }),
    systemConfigService.getPlatformSettings(),
    platformUserService.listUsers({ pageSize: 100 }),
    tenantService.listTenants({ pageSize: 100 }),
  ]);

  return (
    <AppShell>
      <PageHeader
        title="System Config"
        description="Global platform configuration and provider catalog"
      />
      <SystemConfigTabs
        users={users}
        tenants={tenants}
        providers={providers}
        platformSettings={platformSettings}
      />
    </AppShell>
  );
}
