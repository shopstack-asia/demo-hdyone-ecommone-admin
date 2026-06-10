import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantStatus } from "@/types/enums";

interface TenantDangerZoneProps {
  status: TenantStatus;
}

const DANGER_ZONE_COPY: Record<
  TenantStatus,
  { description: string; primary?: { label: string; variant: "outline" | "default" }; secondary?: { label: string } }
> = {
  [TenantStatus.ACTIVE]: {
    description: "Suspending or archiving a tenant stops all integration executions.",
    primary: { label: "Suspend tenant", variant: "outline" },
    secondary: { label: "Archive tenant" },
  },
  [TenantStatus.PENDING]: {
    description: "Archive a pending tenant to remove it before it goes live.",
    secondary: { label: "Archive tenant" },
  },
  [TenantStatus.SUSPENDED]: {
    description:
      "Reactivate the tenant to resume integrations, or archive it to permanently retire this tenant.",
    primary: { label: "Reactivate tenant", variant: "default" },
    secondary: { label: "Archive tenant" },
  },
  [TenantStatus.ARCHIVED]: {
    description: "This tenant is archived. Deleting permanently removes all tenant data and cannot be undone.",
    secondary: { label: "Delete tenant" },
  },
};

export function TenantDangerZone({ status }: TenantDangerZoneProps) {
  const copy = DANGER_ZONE_COPY[status];

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{copy.description}</p>
        <div className="flex flex-wrap gap-2">
          {copy.primary && (
            <Button variant={copy.primary.variant} className="min-h-11">
              {copy.primary.label}
            </Button>
          )}
          {copy.secondary && (
            <Button variant="destructive" className="min-h-11">
              {copy.secondary.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
