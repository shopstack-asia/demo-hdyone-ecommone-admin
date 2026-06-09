import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface TimelineEvent {
  label: string;
  timestamp?: Date;
  durationMs?: number;
  status: "completed" | "active" | "pending" | "error";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, i) => (
        <div key={event.label} className="flex gap-4">
          <div className="flex flex-col items-center">
            {event.status === "completed" && (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            )}
            {event.status === "active" && (
              <Circle className="h-5 w-5 text-info fill-info-subtle shrink-0 animate-pulse" />
            )}
            {event.status === "error" && (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            {event.status === "pending" && (
              <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
            )}
            {i < events.length - 1 && (
              <div className={cn(
                "w-px flex-1 min-h-[32px] my-1",
                event.status === "completed" ? "bg-success/40" : "bg-border"
              )} />
            )}
          </div>
          <div className="pb-6 flex-1">
            <p className={cn(
              "text-sm font-medium",
              event.status === "pending" && "text-muted-foreground"
            )}>
              {event.label}
            </p>
            {event.timestamp && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(event.timestamp)}
                {event.durationMs !== undefined && ` · ${event.durationMs}ms`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
