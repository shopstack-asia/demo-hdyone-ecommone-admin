"use client";

import { AccessTab } from "@/components/system-config/access-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PlatformUser, PlatformSettings, Provider, Tenant } from "@/types/domain";

interface SystemConfigTabsProps {
  users: PlatformUser[];
  tenants: Tenant[];
  providers: Provider[];
  platformSettings: PlatformSettings;
}

export function SystemConfigTabs({ users, tenants, providers, platformSettings }: SystemConfigTabsProps) {
  return (
    <Tabs defaultValue="access">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="access">Access</TabsTrigger>
        <TabsTrigger value="providers">Providers</TabsTrigger>
        <TabsTrigger value="platform">Platform Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="access" className="mt-4">
        <AccessTab users={users} tenants={tenants} />
      </TabsContent>

      <TabsContent value="providers" className="mt-4">
        <DataTable
          caption="Provider catalog"
          getRowId={(r) => r.id}
          columns={[
            { key: "code", header: "Code", cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
            { key: "name", header: "Name", cell: (r) => r.name },
            { key: "category", header: "Category", cell: (r) => <StatusBadge status={r.category} /> },
            { key: "version", header: "Version", hideOnMobile: true, cell: (r) => r.version },
            {
              key: "capabilities",
              header: "Capabilities",
              hideOnMobile: true,
              cell: (r) => <TagList items={r.capabilities} />,
            },
            {
              key: "triggers",
              header: "Supported Triggers",
              hideOnMobile: true,
              cell: (r) => <TagList items={r.supportedTriggers} />,
            },
          ]}
          data={providers}
        />
      </TabsContent>

      <TabsContent value="platform" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Platform Name</span>
              <p>{platformSettings.platformName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Default Timezone</span>
              <p className="font-mono">{platformSettings.defaultTimezone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Max Concurrent Executions</span>
              <p>{platformSettings.maxConcurrentExecutions}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Worker Count</span>
              <p>{platformSettings.workerCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Maintenance Mode</span>
              <p>{platformSettings.maintenanceMode ? "Enabled" : "Disabled"}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <StatusBadge key={item} status={item} />
      ))}
    </div>
  );
}
