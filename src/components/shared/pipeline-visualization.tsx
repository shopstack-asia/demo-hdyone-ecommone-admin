import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

interface PipelineStage {
  label: string;
  active?: boolean;
  completed?: boolean;
  error?: boolean;
}

interface PipelineVisualizationProps {
  stages: PipelineStage[];
  className?: string;
}

export function PipelineVisualization({ stages, className }: PipelineVisualizationProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto py-4", className)}>
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center">
          <div
            className={cn(
              "flex flex-col items-center min-w-[100px] px-3 py-2 rounded-md border text-xs font-medium transition-colors",
              stage.error && "border-destructive/40 bg-destructive-subtle text-destructive-subtle-foreground",
              stage.active && !stage.error && "border-info/50 bg-info-subtle text-info-subtle-foreground",
              stage.completed && !stage.active && !stage.error && "border-success/40 bg-success-subtle text-success-subtle-foreground",
              !stage.active && !stage.completed && !stage.error && "border-border bg-muted/30 text-muted-foreground"
            )}
          >
            <span>{stage.label}</span>
          </div>
          {i < stages.length - 1 && (
            <ArrowDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] mx-1 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
