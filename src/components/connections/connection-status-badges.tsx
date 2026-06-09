import { StatusBadge } from "@/components/shared/status-badge";
import type { Connection } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ConnectionStatusBadgesProps {
  connection: Pick<Connection, "status" | "activeStatus">;
  className?: string;
}

export function ConnectionStatusBadges({ connection, className }: ConnectionStatusBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <StatusBadge status={connection.activeStatus} />
      <StatusBadge status={connection.status} />
    </div>
  );
}
