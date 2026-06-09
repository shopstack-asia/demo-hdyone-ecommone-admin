import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getExecutionDisplayStatus } from "@/lib/execution-display";
import { getExecutionDlqRecordCount } from "@/lib/execution-dlq";
import { formatDate, formatDuration, formatNumber } from "@/lib/format";
import type { Execution, ExecutionStage } from "@/types/domain";
import { ExecutionStatus } from "@/types/enums";
import { RotateCcw } from "lucide-react";

interface ExecutionOperationalInsightProps {
  execution: Execution;
  onNavigateTab?: (tab: string) => void;
}

function stageLabel(stages: ExecutionStage[], stageId: string): string {
  return stages.find((s) => s.stageId === stageId)?.label ?? stageId;
}

export function ExecutionOperationalInsight({ execution, onNavigateTab }: ExecutionOperationalInsightProps) {
  const displayStatus = getExecutionDisplayStatus(execution);
  const insight = execution.operationalInsight;
  const dlqRecordCount = getExecutionDlqRecordCount(execution);

  if (insight.failureAnalysis && (displayStatus === "FAILED" || displayStatus === "PARTIAL_SUCCESS")) {
    const fa = insight.failureAnalysis;
    return (
      <InsightCard title="Failure Analysis">
        <Field label="Failure Stage" value={stageLabel(execution.executionStages, fa.failureStageId)} />
        <Field label="Error Code" value={fa.errorCode} mono />
        <Field label="Error Message" value={fa.errorMessage} />
        <Field label="Failed Records" value={formatNumber(fa.failedRecords)} />
        <Field label="Affected Chunks" value={formatNumber(fa.affectedChunks)} />
        <Field label="Affected Batch" value={fa.affectedBatch} />
        <Field label="First Failure At" value={formatDate(fa.firstFailureAt)} />
        <Field label="Recommended Action" value={fa.recommendedAction} />
        <ActionRow>
          <Button variant="outline" size="sm" className="min-h-9" onClick={() => onNavigateTab?.("errors")}>
            View Errors
          </Button>
          {dlqRecordCount > 0 && (
            <Button variant="outline" size="sm" className="min-h-9" onClick={() => onNavigateTab?.("dlq")}>
              View DLQ
            </Button>
          )}
          {dlqRecordCount > 0 && (
            <Button variant="outline" size="sm" className="min-h-9">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Retry Failed Records
            </Button>
          )}
        </ActionRow>
      </InsightCard>
    );
  }

  if (
    insight.retrySummary &&
    displayStatus === "FAILED" &&
    execution.retrySummary?.enabled &&
    execution.retrySummary.nextRetryAt
  ) {
    const rs = insight.retrySummary;
    return (
      <InsightCard title="Retry Summary">
        <Field label="Strategy" value={rs.strategy} mono />
        <Field label="Retry Attempt" value={`${rs.currentAttempt} / ${rs.maxAttempts}`} />
        <Field label="Next Retry" value={formatDate(rs.nextRetryAt)} />
        <Field label="Last Error" value={rs.lastErrorCode} mono />
        <Field label="Retry Scope" value={rs.retryScope} />
        <ActionRow>
          <Button variant="outline" size="sm" className="min-h-9">Retry Now</Button>
          <Button variant="outline" size="sm" className="min-h-9">Cancel Retry</Button>
          <Button variant="outline" size="sm" className="min-h-9" onClick={() => onNavigateTab?.("retry")}>
            View Retry History
          </Button>
        </ActionRow>
      </InsightCard>
    );
  }

  if (insight.liveStatus && displayStatus === "RUNNING") {
    const live = insight.liveStatus;
    return (
      <InsightCard title="Live Execution Status">
        <Field label="Current Stage" value={stageLabel(execution.executionStages, live.currentStageId)} />
        <Field
          label="Records Processed"
          value={`${formatNumber(live.recordsProcessed)} / ${formatNumber(live.totalRecords)}`}
        />
        <Field
          label="Current Chunk"
          value={`${formatNumber(live.currentChunk)} / ${formatNumber(live.totalChunks)}`}
        />
        <Field label="Running Duration" value={formatDuration(live.runningDurationMs)} />
        <Field label="Estimated Completion" value={`~${formatDuration(live.estimatedRemainingMs)} remaining`} />
        <Field label="Worker" value={live.workerId} mono />
        <ActionRow>
          <Button variant="outline" size="sm" className="min-h-9" disabled={execution.status !== ExecutionStatus.RUNNING}>
            Cancel Execution
          </Button>
        </ActionRow>
      </InsightCard>
    );
  }

  if (insight.performanceAnalysis && displayStatus === "SUCCESS") {
    const pa = insight.performanceAnalysis;
    return (
      <InsightCard title="Performance Analysis">
        <Field label="Slowest Stage" value={pa.slowestStageLabel} />
        <Field label="Duration" value={formatDuration(pa.slowestStageDurationMs)} />
        <Field label="Share of Total Time" value={`${pa.slowestStageShare}%`} />
        <Field label="Average Response Time" value={`${pa.averageResponseTimeMs} ms`} />
        <Field label="Records Per Second" value={formatNumber(pa.recordsPerSecond)} />
        <Field label="API Calls" value={formatNumber(pa.apiCalls)} />
        <Field label="Bottleneck" value={pa.bottleneckAssessment} />
      </InsightCard>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-8 text-center text-sm text-muted-foreground h-full flex items-center justify-center">
      No operational insight available for this execution.
    </div>
  );
}

function InsightCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-5 space-y-4 h-full">
      <h3 className="font-semibold">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">{children}</dl>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`font-medium mt-1 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 sm:col-span-2 pt-2">{children}</div>;
}
