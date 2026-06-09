import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MappingType } from "@/types/mapping";

const TYPE_STYLES: Record<MappingType, string> = {
  DIRECT: "bg-success-subtle text-success-subtle-foreground border-transparent",
  TRANSFORM: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-transparent",
  FORMULA: "bg-info-subtle text-info-subtle-foreground border-transparent",
  CONSTANT: "bg-muted text-muted-foreground border-transparent",
  LOOKUP: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-transparent",
  CONCAT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border-transparent",
  CUSTOM: "bg-muted text-foreground border-transparent",
};

interface MappingTypeBadgeProps {
  type: MappingType;
  className?: string;
}

export function MappingTypeBadge({ type, className }: MappingTypeBadgeProps) {
  return (
    <Badge className={cn("text-xs font-medium border", TYPE_STYLES[type], className)}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </Badge>
  );
}
