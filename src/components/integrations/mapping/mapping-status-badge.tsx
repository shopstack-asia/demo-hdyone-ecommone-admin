import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MappingStatus } from "@/types/mapping";

const STATUS_STYLES: Record<MappingStatus, string> = {
  MAPPED: "bg-success-subtle text-success-subtle-foreground border-transparent",
  NEED_REVIEW: "bg-warning-subtle text-warning-subtle-foreground border-transparent",
  UNMAPPED: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent",
  ERROR: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent",
};

interface MappingStatusBadgeProps {
  status: MappingStatus;
  className?: string;
}

export function MappingStatusBadge({ status, className }: MappingStatusBadgeProps) {
  return (
    <Badge className={cn("text-xs font-medium border", STATUS_STYLES[status], className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
