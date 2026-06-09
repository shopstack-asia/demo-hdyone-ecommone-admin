"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExecutionHeader } from "@/components/executions/execution-header";
import { ExecutionErrorSummary } from "@/components/executions/execution-error-summary";
import { ExecutionErrorRecords } from "@/components/executions/execution-error-records";
import { ExecutionDlqSummary } from "@/components/executions/execution-dlq-summary";
import { ExecutionOverviewDashboard } from "@/components/executions/execution-overview-dashboard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getExecutionDlqRecordCount } from "@/lib/execution-dlq";
import { dlqDetailPath } from "@/lib/navigation";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DlqRecord, Execution, ExecutionErrorRecord, Integration, Provider, RetryRecord, Tenant } from "@/types/domain";
import { ExecutionStatus } from "@/types/enums";

interface ExecutionDetailViewProps {
  execution: Execution;
  integration: Integration | null;
  tenant: Tenant | null;
  relatedDlq: DlqRecord[];
  errorRecords: ExecutionErrorRecord[];
  retryRecords: RetryRecord[];
  integrationFlow: string;
  sourceLabel: string;
  destinationLabel: string;
  sourceProvider?: Provider | null;
  destinationProvider?: Provider | null;
  initialTab?: string;
}

const EXECUTION_TABS = ["overview", "chunks", "errors", "retry", "dlq"] as const;

export function ExecutionDetailView({
  execution,
  integration,
  tenant,
  relatedDlq,
  errorRecords,
  retryRecords,
  integrationFlow,
  sourceLabel,
  destinationLabel,
  sourceProvider,
  destinationProvider,
  initialTab,
}: ExecutionDetailViewProps) {
  const [activeTab, setActiveTab] = useState(
    initialTab && EXECUTION_TABS.includes(initialTab as (typeof EXECUTION_TABS)[number])
      ? initialTab
      : "overview"
  );

  const dlqReturnTo = `/executions/${execution.id}?tab=dlq`;

  const chunks = Array.from({ length: execution.chunkCount }, (_, i) => ({
    chunkNumber: i + 1,
    records: Math.floor(execution.recordsProcessed / Math.max(execution.chunkCount, 1)),
    status: i >= execution.chunksCompleted ? execution.status : ExecutionStatus.COMPLETED,
  }));

  const backHref = tenant ? `/tenants/${tenant.id}/executions` : "/dashboard";
  const errorCount = execution.errorSummary?.errorCount ?? execution.recordsFailed;
  const dlqCount = getExecutionDlqRecordCount(execution);

  return (
    <div className="space-y-6">
      <ExecutionHeader
        execution={execution}
        integration={integration}
        tenant={tenant}
        integrationFlow={integrationFlow}
        backHref={backHref}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chunks" className="gap-2">
            Chunks
            <TabCountBadge count={execution.chunkCount} />
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-2">
            Errors
            <TabCountBadge count={errorCount} tone={errorCount > 0 ? "destructive" : "default"} />
          </TabsTrigger>
          <TabsTrigger value="retry" className="gap-2">
            Retry
            <TabCountBadge count={retryRecords.length} />
          </TabsTrigger>
          <TabsTrigger value="dlq" className="gap-2">
            DLQ
            <TabCountBadge count={dlqCount} tone={dlqCount > 0 ? "warning" : "default"} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ExecutionOverviewDashboard
            execution={execution}
            integration={integration}
            sourceLabel={sourceLabel}
            destinationLabel={destinationLabel}
            sourceProvider={sourceProvider}
            destinationProvider={destinationProvider}
            batchSize={integration?.executionPolicy?.batchSize}
            onNavigateTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="chunks" className="mt-4">
          <DataTable
            caption="Execution chunks"
            getRowId={(r) => String(r.chunkNumber)}
            columns={[
              { key: "chunk", header: "Chunk #", cell: (r) => r.chunkNumber },
              { key: "records", header: "Records", cell: (r) => formatNumber(r.records) },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={chunks}
          />
        </TabsContent>

        <TabsContent value="errors" className="mt-4 space-y-6">
          <ExecutionErrorSummary execution={execution} />
          <ExecutionErrorRecords records={errorRecords} />
        </TabsContent>

        <TabsContent value="retry" className="mt-4">
          <DataTable
            caption="Retry history"
            getRowId={(r) => r.id}
            columns={[
              { key: "id", header: "Retry ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: "attempt", header: "Attempt", cell: (r) => r.attempt },
              { key: "strategy", header: "Strategy", cell: (r) => <StatusBadge status={r.strategy} /> },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              { key: "next", header: "Next Retry", cell: (r) => formatDate(r.nextRetryAt) },
            ]}
            data={retryRecords}
            emptyMessage="No retry records for this execution."
          />
        </TabsContent>

        <TabsContent value="dlq" className="mt-4 space-y-6">
          <ExecutionDlqSummary execution={execution} />
          <DataTable
            caption="DLQ records"
            getRowId={(r) => r.id}
            rowHref={(r) => dlqDetailPath(r.id, dlqReturnTo)}
            columns={[
              { key: "id", header: "DLQ ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: "stage", header: "Stage", cell: (r) => <StatusBadge status={r.stage} /> },
              { key: "error", header: "Error", cell: (r) => r.errorCode },
              {
                key: "actions",
                header: "Actions",
                cell: (r) => (
                  <Link href={dlqDetailPath(r.id, dlqReturnTo)} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "min-h-10 inline-flex")}>
                    View
                  </Link>
                ),
              },
            ]}
            data={relatedDlq}
            emptyMessage="No DLQ records for this execution."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabCountBadge({
  count,
  tone = "default",
}: {
  count: number;
  tone?: "default" | "destructive" | "warning";
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "min-w-5 h-5 px-1.5 tabular-nums font-normal",
        tone === "destructive" && count > 0 && "bg-destructive/10 text-destructive",
        tone === "warning" && count > 0 && "bg-warning-subtle text-warning-subtle-foreground"
      )}
    >
      {formatNumber(count)}
    </Badge>
  );
}
