"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ValidationResult, ConnectionHealthMetrics } from "@/lib/provider-connection/types";
import { cn } from "@/lib/utils";

interface ValidationResultPanelProps {
  result: ValidationResult;
  health?: ConnectionHealthMetrics;
  className?: string;
}

export function ValidationResultPanel({ result, health, className }: ValidationResultPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        result.success ? "bg-success-subtle border-success/20" : "bg-destructive-subtle border-destructive/20"
      )}>
        {result.success ? (
          <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        )}
        <div>
          <p className={cn("font-semibold", result.success ? "text-success-subtle-foreground" : "text-destructive-subtle-foreground")}>
            {result.success ? "Connection validated" : "Validation failed"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{result.responseSummary}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-lg border border-border/60 bg-muted/30 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">Status</dt>
          <dd className="mt-1"><StatusBadge status={result.success ? "HEALTHY" : "ERROR"} /></dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">Response time</dt>
          <dd className="font-medium mt-1">{result.responseTimeMs}ms</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">Authentication</dt>
          <dd className="font-medium mt-1">{result.authStatus}</dd>
        </div>
        {result.providerVersion && (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Provider version</dt>
            <dd className="font-medium mt-1">{result.providerVersion}</dd>
          </div>
        )}
        {result.statusCode && (
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Status code</dt>
            <dd className="font-mono font-medium mt-1">{result.statusCode}</dd>
          </div>
        )}
        {health && (
          <>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Success rate</dt>
              <dd className="font-medium mt-1">{health.successRate.toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Last tested</dt>
              <dd className="font-medium mt-1">{new Date(health.lastTested).toLocaleString()}</dd>
            </div>
          </>
        )}
      </dl>

      {result.sampleResponse && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Sample response</p>
          <pre className="text-xs font-mono bg-muted/40 p-4 rounded-md overflow-auto max-h-48">{result.sampleResponse}</pre>
        </div>
      )}
    </div>
  );
}
