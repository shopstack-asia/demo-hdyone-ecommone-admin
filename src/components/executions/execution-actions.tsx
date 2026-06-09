import { Button } from "@/components/ui/button";
import { getExecutionDisplayStatus } from "@/lib/execution-display";
import type { Execution } from "@/types/domain";
import { Square } from "lucide-react";

interface ExecutionActionsProps {
  execution: Execution;
}

export function ExecutionActions({ execution }: ExecutionActionsProps) {
  const displayStatus = getExecutionDisplayStatus(execution);

  if (displayStatus !== "RUNNING") {
    return null;
  }

  return (
    <Button variant="outline" className="min-h-11">
      <Square className="h-4 w-4 mr-2" />
      Cancel Execution
    </Button>
  );
}
