"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { formatDate } from "@/lib/format";
import type { AuditLog, DlqRecord, Execution, Integration, RetryRecord, Tenant } from "@/types/domain";
import { RotateCcw } from "lucide-react";

interface DlqDetailViewProps {
  record: DlqRecord;
  execution: Execution | null;
  integration: Integration | null;
  tenant: Tenant | null;
  retryRecords: RetryRecord[];
  auditLogs: AuditLog[];
  backHref: string;
}

export function DlqDetailView({
  record,
  execution,
  integration,
  tenant,
  retryRecords,
  auditLogs,
  backHref,
}: DlqDetailViewProps) {
  const initialPayload = JSON.stringify(record.payload ?? {}, null, 2);
  const [payloadText, setPayloadText] = useState(initialPayload);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [replayMessage, setReplayMessage] = useState<string | null>(null);

  function handleReplay() {
    try {
      JSON.parse(payloadText);
      setPayloadError(null);
      setReplayMessage("Replay queued with the updated payload.");
    } catch {
      setPayloadError("Payload must be valid JSON before replay.");
      setReplayMessage(null);
    }
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={backHref}
        title={record.id}
        subtitle={
          <>
            {integration?.name ?? record.integrationId}
            {tenant && (
              <> · <Link href={`/tenants/${tenant.id}`} className="text-link hover:text-link-hover hover:underline">{tenant.name}</Link></>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Failed stage</CardTitle></CardHeader>
          <CardContent><StatusBadge status={record.stage} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Created</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{formatDate(record.createdAt)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Execution</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/executions/${record.executionId}`} className="text-sm font-mono text-link hover:text-link-hover hover:underline">
              {record.executionId}
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payload">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payload">Payload</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
          <TabsTrigger value="retry">Retry History</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Integration</span><p className="font-medium">{integration?.name ?? record.integrationId}</p></div>
                <div><span className="text-muted-foreground">Error code</span><p className="font-mono">{record.errorCode}</p></div>
                {execution && (
                  <div><span className="text-muted-foreground">Execution status</span><p className="mt-1"><StatusBadge status={execution.status} /></p></div>
                )}
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive-subtle p-4">
                <p className="text-xs font-medium text-destructive-subtle-foreground uppercase tracking-wide mb-1">Error message</p>
                <p className="text-sm text-destructive-subtle-foreground">{record.errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and edit the JSON payload, then replay this record to the destination.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={payloadText}
                onChange={(event) => {
                  setPayloadText(event.target.value);
                  setPayloadError(null);
                  setReplayMessage(null);
                }}
                spellCheck={false}
                className="min-h-[360px] font-mono text-xs leading-relaxed"
                aria-invalid={payloadError != null}
              />
              {payloadError && <p className="text-sm text-destructive">{payloadError}</p>}
              {replayMessage && <p className="text-sm text-success-subtle-foreground">{replayMessage}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-11" onClick={handleReplay}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Replay with payload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    setPayloadText(initialPayload);
                    setPayloadError(null);
                    setReplayMessage(null);
                  }}
                >
                  Reset payload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Error code</dt><dd className="font-mono font-medium">{record.errorCode}</dd></div>
                <div><dt className="text-muted-foreground">Stage</dt><dd><StatusBadge status={record.stage} /></dd></div>
              </dl>
              <pre className="text-xs font-mono bg-muted/40 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                {record.stackTrace ?? record.errorMessage}
              </pre>
            </CardContent>
          </Card>
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
              { key: "next", header: "Next retry", cell: (r) => formatDate(r.nextRetryAt) },
            ]}
            data={retryRecords}
            emptyMessage="No retry attempts for this DLQ record."
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <DataTable
            caption="Audit trail"
            getRowId={(r) => r.id}
            columns={[
              { key: "timestamp", header: "Timestamp", cell: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
              { key: "user", header: "User", cell: (r) => r.userName },
              { key: "action", header: "Action", cell: (r) => <StatusBadge status={r.action} /> },
              { key: "result", header: "Result", cell: (r) => <StatusBadge status={r.result} /> },
              { key: "details", header: "Details", hideOnMobile: true, cell: (r) => <span className="text-xs">{r.details}</span> },
            ]}
            data={auditLogs}
            emptyMessage="No audit entries for this DLQ record."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
