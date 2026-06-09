import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface RuleChipProps {
  label: string;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export function RuleChip({ label, variant = "default", className }: RuleChipProps) {
  const styles = {
    default: "bg-muted text-muted-foreground border-border/60",
    success: "bg-success-subtle text-success-subtle-foreground border-transparent",
    warning: "bg-warning-subtle text-warning-subtle-foreground border-transparent",
  };

  return (
    <Badge variant="outline" className={cn("text-xs gap-1 font-normal", styles[variant], className)}>
      <Shield className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
