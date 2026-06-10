import { TenantDangerZone } from "@/components/tenants/tenant-danger-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { tenantService } from "@/services";
import { notFound } from "next/navigation";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantSettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;
  const tenant = await tenantService.getTenant(id);
  if (!tenant) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenant information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Tenant name</Label>
              <Input id="tenant-name" defaultValue={tenant.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-code">Tenant code</Label>
              <Input id="tenant-code" defaultValue={tenant.code} className="font-mono" readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-country">Country</Label>
              <Input id="tenant-country" defaultValue={tenant.country} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-timezone">Timezone</Label>
              <Input id="tenant-timezone" defaultValue={tenant.timezone} className="font-mono" />
            </div>
          </div>
          <Button className="min-h-11">Save changes</Button>
        </CardContent>
      </Card>

      <TenantDangerZone status={tenant.status} />
    </div>
  );
}
