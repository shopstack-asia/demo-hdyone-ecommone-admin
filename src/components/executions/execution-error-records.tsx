"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { ExecutionErrorRecord } from "@/types/domain";
import { Eye } from "lucide-react";

interface ExecutionErrorRecordsProps {
  records: ExecutionErrorRecord[];
}

export function ExecutionErrorRecords({ records }: ExecutionErrorRecordsProps) {
  const [selected, setSelected] = useState<ExecutionErrorRecord | null>(null);

  return (
    <>
      <DataTable
        caption="Execution error records"
        getRowId={(record) => record.id}
        onRowClick={setSelected}
        emptyMessage="No error records for this execution."
        columns={[
          {
            key: "recordKey",
            header: "Record",
            cell: (record) => <span className="font-mono text-xs">{record.recordKey}</span>,
          },
          {
            key: "stage",
            header: "Stage",
            cell: (record) => <span className="font-mono text-xs">{record.stageId}</span>,
          },
          {
            key: "errorCode",
            header: "Error Code",
            cell: (record) => <span className="font-mono text-xs">{record.errorCode}</span>,
          },
          {
            key: "message",
            header: "Message",
            cell: (record) => (
              <span className="line-clamp-2 text-muted-foreground">{record.errorMessage}</span>
            ),
          },
          {
            key: "chunk",
            header: "Chunk",
            hideOnMobile: true,
            cell: (record) => (record.chunkNumber != null ? record.chunkNumber : "—"),
          },
          {
            key: "occurred",
            header: "Occurred",
            hideOnMobile: true,
            cell: (record) => formatDate(record.createdAt),
          },
          {
            key: "actions",
            header: "",
            cell: (record) => (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-9"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(record);
                }}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Details
              </Button>
            ),
          },
        ]}
        data={records}
      />

      <ExecutionErrorDetailDialog
        record={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function ExecutionErrorDetailDialog({
  record,
  onClose,
}: {
  record: ExecutionErrorRecord | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={record != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {record && (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono text-base">{record.id}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Record {record.recordKey} · Stage {record.stageId}
              </p>
            </DialogHeader>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailField label="Error Code" value={record.errorCode} mono />
              <DetailField label="Stage" value={record.stageId} mono />
              <DetailField
                label="Chunk"
                value={record.chunkNumber != null ? String(record.chunkNumber) : "—"}
              />
              <DetailField label="Occurred At" value={formatDate(record.createdAt)} />
              {record.fieldPath && (
                <DetailField label="Field Path" value={record.fieldPath} mono className="sm:col-span-2" />
              )}
              <DetailField label="Message" value={record.errorMessage} className="sm:col-span-2" />
            </dl>

            {record.payload && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Payload</p>
                <pre className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(record.payload, null, 2)}
                </pre>
              </div>
            )}

            {record.stackTrace && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stack Trace</p>
                <pre className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {record.stackTrace}
                </pre>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailField({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`font-medium mt-1 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</dd>
    </div>
  );
}
