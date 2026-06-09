import { ConnectionStatusBadges } from "@/components/connections/connection-status-badges";
import { ProviderLogo } from "@/components/providers/provider-logo";
import { Badge } from "@/components/ui/badge";
import type { Connection, Provider, ProviderDataFlow } from "@/types/domain";
import { ArrowRight, Package } from "lucide-react";

interface MappingContextSummaryProps {
  sourceProvider?: Provider;
  sourceConnection?: Connection;
  dataFlow?: ProviderDataFlow;
  destinationProvider?: Provider;
  destinationConnection?: Connection;
  templateCode?: string;
  templateConfidence?: number;
}

export function MappingContextSummary({
  sourceProvider,
  sourceConnection,
  dataFlow,
  destinationProvider,
  destinationConnection,
  templateCode,
  templateConfidence,
}: MappingContextSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <ContextBlock title="Source">
        {sourceProvider && sourceConnection ? (
          <div className="flex items-start gap-3">
            <ProviderLogo
              code={sourceProvider.code}
              name={sourceProvider.name}
              category={sourceProvider.category}
              size={36}
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{sourceConnection.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {connectionSlug(sourceConnection, sourceProvider)}
              </p>
              <ConnectionStatusBadges connection={sourceConnection} className="mt-2" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </ContextBlock>

      <ContextBlock title="Data Flow">
        {dataFlow ? (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-subtle text-info-subtle-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{dataFlow.name}</p>
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {dataFlow.category}
              </Badge>
              {dataFlow.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{dataFlow.description}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </ContextBlock>

      <ContextBlock title="Destination">
        {destinationProvider && destinationConnection ? (
          <div className="flex items-start gap-3">
            <ProviderLogo
              code={destinationProvider.code}
              name={destinationProvider.name}
              category={destinationProvider.category}
              size={36}
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{destinationConnection.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {connectionSlug(destinationConnection, destinationProvider)}
              </p>
              <ConnectionStatusBadges connection={destinationConnection} className="mt-2" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </ContextBlock>

      <ContextBlock title="Suggested Template" highlight>
        {templateCode ? (
          <div className="space-y-2">
            <p className="font-mono text-sm font-semibold">{templateCode}</p>
            {templateConfidence != null && (
              <p className="text-sm">
                Confidence{" "}
                <span className="font-semibold text-success-subtle-foreground">{templateConfidence}%</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No template found</p>
        )}
      </ContextBlock>
    </div>
  );
}

function connectionSlug(connection: Connection, provider?: Provider): string {
  const base = provider?.code ?? "conn";
  const slug = connection.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${slug}`.slice(0, 32);
}

function ContextBlock({
  title,
  children,
  highlight,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-primary/30 bg-primary-subtle/20" : "border-border/60 bg-card/80"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
        {title}
        {highlight && <ArrowRight className="h-3 w-3 opacity-50" aria-hidden="true" />}
      </p>
      {children}
    </div>
  );
}
