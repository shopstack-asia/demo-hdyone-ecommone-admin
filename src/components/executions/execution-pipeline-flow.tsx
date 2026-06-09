import { cn } from "@/lib/utils";
import { formatDuration, formatNumber } from "@/lib/format";
import { getProviderCategoryStyles } from "@/lib/provider-card-styles";
import { ProviderLogo } from "@/components/providers/provider-logo";
import type { Execution, ExecutionStage, Provider } from "@/types/domain";
import { ArrowRight, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

interface ExecutionPipelineFlowProps {
  execution: Execution;
  sourceLabel: string;
  destinationLabel: string;
  sourceProvider?: Provider | null;
  destinationProvider?: Provider | null;
}

export function ExecutionPipelineFlow({
  execution,
  sourceLabel,
  destinationLabel,
  sourceProvider,
  destinationProvider,
}: ExecutionPipelineFlowProps) {
  const stages = execution.executionStages;

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-5 overflow-x-auto">
      <h3 className="font-semibold mb-1">Pipeline execution flow</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Stage-level status and timing for this execution.
      </p>
      <div className="flex items-stretch gap-2 min-w-max pb-2">
        <EndpointCard label="Source Target" system={sourceLabel} provider={sourceProvider} />
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" aria-hidden="true" />
        {stages.map((stage, index) => (
          <div key={stage.stageId} className="flex items-center gap-2">
            <StageCard stage={stage} />
            {index < stages.length - 1 ? (
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <EndpointCard
                  label="Destination Target"
                  system={destinationLabel}
                  provider={destinationProvider}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EndpointCard({
  label,
  system,
  provider,
}: {
  label: string;
  system: string;
  provider?: Provider | null;
}) {
  const categoryStyles = provider ? getProviderCategoryStyles(provider.category) : null;

  return (
    <div className="min-w-[148px] rounded-lg border border-border/60 bg-muted/30 p-3 self-stretch flex flex-col justify-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2.5 mt-2">
        {provider && (
          <ProviderLogo
            code={provider.code}
            name={provider.name}
            category={provider.category}
            size={36}
            logoClassName={categoryStyles?.logoBg}
          />
        )}
        <p className="font-medium text-sm leading-tight">{system}</p>
      </div>
    </div>
  );
}

function StageCard({ stage }: { stage: ExecutionStage }) {
  const Icon =
    stage.status === "FAILED"
      ? XCircle
      : stage.status === "RUNNING"
        ? Loader2
        : stage.status === "PENDING"
          ? Circle
          : CheckCircle2;

  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border p-3 bg-background/80",
        stage.status === "FAILED" && "border-destructive/40 bg-destructive-subtle/20",
        stage.status === "SUCCESS" && "border-success/20",
        stage.status === "RUNNING" && "border-info/20"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            stage.status === "FAILED" && "text-destructive",
            stage.status === "SUCCESS" && "text-success-subtle-foreground",
            stage.status === "RUNNING" && "text-info-subtle-foreground animate-spin",
            stage.status === "PENDING" && "text-muted-foreground"
          )}
        />
        <p className="font-medium text-sm">{stage.label}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-2 capitalize">{stage.status.toLowerCase()}</p>
      <p className="text-xs mt-1 font-medium">{formatDuration(stage.durationMs)}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatNumber(stage.recordsProcessed)} records
        {stage.recordsFailed > 0 && (
          <span className="text-destructive"> · {formatNumber(stage.recordsFailed)} failed</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {stage.percentageOfTotalTime}% of total time
      </p>
    </div>
  );
}
