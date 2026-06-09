import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";

interface IntegrationsEmptyStateProps {
  tenantId: string;
  hasConnections: boolean;
}

export function IntegrationsEmptyState({ tenantId, hasConnections }: IntegrationsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <GitBranch className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-sm font-semibold mb-1">No integrations yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasConnections
          ? "Create your first integration flow by selecting source and destination connections."
          : "Configure provider connections first, then define integration flows."}
      </p>
      {hasConnections ? (
        <Link href={`/tenants/${tenantId}/integrations/new`}>
          <Button className="min-h-11">
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            Create integration
          </Button>
        </Link>
      ) : (
        <Link href={`/tenants/${tenantId}/connections`}>
          <Button className="min-h-11">
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            Add connections
          </Button>
        </Link>
      )}
    </div>
  );
}
