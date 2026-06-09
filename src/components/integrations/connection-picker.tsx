"use client";

import { ConnectionStatusBadges } from "@/components/connections/connection-status-badges";
import { ProviderLogo } from "@/components/providers/provider-logo";
import { formatCapabilities } from "@/lib/provider-capabilities";
import { providerCardClassName, getProviderCategoryStyles } from "@/lib/provider-card-styles";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Connection, Provider } from "@/types/domain";
import { CheckCircle2 } from "lucide-react";

interface ConnectionPickerProps {
  connections: Connection[];
  providerMap: Map<string, Provider>;
  selectedId: string;
  onSelect: (connectionId: string) => void;
  emptyMessage: string;
}

export function ConnectionPicker({
  connections,
  providerMap,
  selectedId,
  onSelect,
  emptyMessage,
}: ConnectionPickerProps) {
  if (connections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center max-w-md mx-auto">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {connections.map((connection) => {
        const provider = providerMap.get(connection.providerId);
        if (!provider) return null;

        const selected = selectedId === connection.id;
        const categoryStyles = getProviderCategoryStyles(provider.category);

        return (
          <button
            key={connection.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(connection.id)}
            className={cn(
              providerCardClassName(selected, provider.category),
              "p-5 text-left flex flex-col gap-3"
            )}
          >
            <div className="flex items-start gap-3 pl-2">
              <ProviderLogo
                code={provider.code}
                name={provider.name}
                category={provider.category}
                size={44}
                logoClassName={categoryStyles.logoBg}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{connection.name}</p>
                  {selected && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{provider.name}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <ConnectionStatusBadges connection={connection} />
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      categoryStyles.badge
                    )}
                  >
                    {provider.category.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-2">
              Capabilities: {formatCapabilities(provider.capabilities)}
            </p>
            <p className="text-xs text-muted-foreground pl-2">
              Last tested: {formatDate(connection.lastTestedAt) ?? "Never"}
              {connection.lastUsedAt && (
                <> · Last used: {formatDate(connection.lastUsedAt)}</>
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
}
