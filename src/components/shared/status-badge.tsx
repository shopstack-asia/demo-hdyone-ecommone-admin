import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  SUCCESS: "default",
  PARTIAL_SUCCESS: "secondary",
  HEALTHY: "default",
  COMPLETED: "default",
  CLOSED: "default",
  RESOLVED: "default",
  REPLAYED: "default",

  RUNNING: "secondary",
  QUEUED: "secondary",
  VALIDATING: "secondary",
  MAPPING: "secondary",
  TRANSFORMING: "secondary",
  ROUTING: "secondary",
  DELIVERING: "secondary",
  IN_PROGRESS: "secondary",
  PENDING: "secondary",
  HALF_OPEN: "secondary",
  TESTING: "secondary",
  WARNING: "secondary",
  SOURCE: "secondary",
  DESTINATION: "secondary",
  SCHEDULE: "secondary",
  WEBHOOK: "secondary",
  API: "secondary",
  PLATFORM_ADMIN: "default",
  TENANT_OPERATOR: "secondary",
  TENANT_VIEWER: "outline",
  ALL_TENANTS: "secondary",
  BREAK: "secondary",

  FAILED: "destructive",
  ERROR: "destructive",
  OPEN: "destructive",
  DLQ: "destructive",
  SUSPENDED: "destructive",
  EXHAUSTED: "destructive",
  DISCARDED: "destructive",
  FAILURE: "destructive",

  DRAFT: "outline",
  INACTIVE: "outline",
  CANCELLED: "outline",
  ARCHIVED: "outline",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  SUCCESS: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  PARTIAL_SUCCESS: "bg-warning-subtle text-warning-subtle-foreground border-transparent hover:bg-warning-subtle/80",
  HEALTHY: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  COMPLETED: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  RESOLVED: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  REPLAYED: "bg-success-subtle text-success-subtle-foreground border-transparent hover:bg-success-subtle/80",
  CLOSED: "bg-muted text-muted-foreground border-transparent",

  RUNNING: "bg-info-subtle text-info-subtle-foreground border-transparent hover:bg-info-subtle/80",
  QUEUED: "bg-warning-subtle text-warning-subtle-foreground border-transparent hover:bg-warning-subtle/80",
  WARNING: "bg-warning-subtle text-warning-subtle-foreground border-transparent hover:bg-warning-subtle/80",
  HALF_OPEN: "bg-warning-subtle text-warning-subtle-foreground border-transparent hover:bg-warning-subtle/80",
  BREAK: "bg-warning-subtle text-warning-subtle-foreground border-transparent hover:bg-warning-subtle/80",
  ALL_TENANTS: "bg-info-subtle text-info-subtle-foreground border-transparent hover:bg-info-subtle/80",

  FAILED: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent hover:bg-destructive-subtle/80",
  ERROR: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent hover:bg-destructive-subtle/80",
  OPEN: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent hover:bg-destructive-subtle/80",
  DLQ: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent hover:bg-destructive-subtle/80",
  FAILURE: "bg-destructive-subtle text-destructive-subtle-foreground border-transparent hover:bg-destructive-subtle/80",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? "outline";
  const semanticStyle = STATUS_STYLES[status];

  if (semanticStyle) {
    return (
      <Badge className={cn("font-mono text-xs border", semanticStyle, className)}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  }

  return (
    <Badge variant={variant} className={cn("font-mono text-xs", className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
