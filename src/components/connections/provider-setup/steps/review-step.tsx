"use client";

import { ConnectionHealthChart } from "@/components/connections/connection-health-chart";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/providers/provider-logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { MaskedSecretDisplay } from "../shared/secret-input";
import { MetadataPanel } from "../shared/metadata-panel";
import { isSecretKey } from "@/lib/provider-connection/validate";
import type { ConnectionHealthMetrics, DiscoveredMetadata } from "@/lib/provider-connection/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Provider } from "@/types/domain";
import { RefreshCw, RotateCcw } from "lucide-react";

interface ReviewStepProps {
  provider: Provider;
  connectionName: string;
  configuration: Record<string, string>;
  health: ConnectionHealthMetrics | null;
  metadata: DiscoveredMetadata | null;
  onRetest?: () => void;
  onRotateCredentials?: () => void;
  isRetesting?: boolean;
  connectionMeta?: {
    lastUsedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

const SKIP_REVIEW_KEYS = new Set(["oauthConnected", "configured", "_healthMetrics", "_metadata", "_validatedAt"]);

type ConfigSummaryEntry = {
  key: string;
  label: string;
  value: string;
  isSecret: boolean;
};

function buildConfigSummaryEntries(
  provider: Provider,
  configuration: Record<string, string>
): ConfigSummaryEntry[] {
  const seen = new Set<string>();
  const entries: ConfigSummaryEntry[] = [];

  for (const field of provider.configurationSchema ?? []) {
    if (SKIP_REVIEW_KEYS.has(field.key) || field.key.startsWith("_")) continue;
    const value = (configuration[field.key] ?? "").trim();
    if (!value) continue;
    seen.add(field.key);
    entries.push({
      key: field.key,
      label: field.label,
      value,
      isSecret: field.type === "password" || isSecretKey(field.key),
    });
  }

  for (const [key, value] of Object.entries(configuration)) {
    if (seen.has(key) || SKIP_REVIEW_KEYS.has(key) || key.startsWith("_")) continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    entries.push({
      key,
      label: formatLabel(key),
      value: trimmed,
      isSecret: isSecretKey(key),
    });
  }

  return entries;
}

export function ReviewStep({
  provider,
  connectionName,
  configuration,
  health,
  metadata,
  onRetest,
  onRotateCredentials,
  isRetesting,
  connectionMeta,
}: ReviewStepProps) {
  const configEntries = buildConfigSummaryEntries(provider, configuration);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-5 rounded-xl border border-border/60 bg-card/80">
        <ProviderLogo code={provider.code} name={provider.name} category={provider.category} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg">{connectionName}</p>
          <p className="text-sm text-muted-foreground">{provider.name} · {provider.category}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {health && <StatusBadge status={health.status} />}
          {onRetest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetest}
              disabled={isRetesting}
              className="min-h-9"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isRetesting ? "animate-spin" : ""}`} />
              Re-test connection
            </Button>
          )}
        </div>
      </div>

      {health && (
        <dl
          className={cn(
            "grid gap-4 p-5 rounded-lg border border-border/60 bg-muted/30 text-sm items-center",
            connectionMeta ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          <div className="flex justify-center sm:justify-start">
            <ConnectionHealthChart
              successRate={health.successRate}
              responseTimeMs={health.responseTimeMs}
            />
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Last tested</dt>
            <dd className="font-medium mt-1">{new Date(health.lastTested).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Last used</dt>
            <dd className="font-medium mt-1">
              {connectionMeta ? formatDate(connectionMeta.lastUsedAt ?? undefined) ?? "Never" : "Never"}
            </dd>
          </div>
          {connectionMeta && (
            <>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Created</dt>
                <dd className="font-medium mt-1">{formatDate(connectionMeta.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Updated</dt>
                <dd className="font-medium mt-1">{formatDate(connectionMeta.updatedAt)}</dd>
              </div>
            </>
          )}
        </dl>
      )}

      <div>
        <h3 className="font-semibold mb-3">Configuration summary</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] gap-x-6 gap-y-3 p-5 rounded-lg border border-border/60 bg-muted/30 text-sm [&>*]:min-w-0">
          {configEntries.length === 0 ? (
            <p className="text-muted-foreground col-span-full">No configuration saved yet.</p>
          ) : (
            configEntries.map(({ key, label, value, isSecret }) =>
              isSecret ? (
                <MaskedSecretDisplay key={key} label={label} value={value} />
              ) : (
                <div key={key}>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
                  <dd className="font-medium mt-1 break-all">{value}</dd>
                </div>
              )
            )
          )}
        </dl>
      </div>

      {metadata && (
        <div>
          <h3 className="font-semibold mb-3">Discovered metadata</h3>
          <MetadataPanel metadata={metadata} />
        </div>
      )}

      {onRotateCredentials && (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onRotateCredentials} className="min-h-11">
            <RotateCcw className="h-4 w-4 mr-2" />
            Rotate credentials
          </Button>
        </div>
      )}
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
