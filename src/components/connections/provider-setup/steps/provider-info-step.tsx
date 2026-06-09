"use client";

import { Input } from "@/components/ui/input";
import { ProviderLogo } from "@/components/providers/provider-logo";
import { formatCapabilities } from "@/lib/provider-capabilities";
import { getProviderCategoryStyles } from "@/lib/provider-card-styles";
import { getProviderAuthMethod } from "../registry";
import { cn } from "@/lib/utils";
import type { Provider } from "@/types/domain";
import { Search } from "lucide-react";
import { FieldError } from "@/components/wizard/field-error";

interface ProviderInfoStepProps {
  providers: Provider[];
  filteredProviders: Provider[];
  providerSearch: string;
  onSearchChange: (value: string) => void;
  selectedProviderId: string;
  onSelectProvider: (id: string) => void;
  providerError?: string;
}

export function ProviderInfoStep({
  providers,
  filteredProviders,
  providerSearch,
  onSearchChange,
  selectedProviderId,
  onSelectProvider,
  providerError,
}: ProviderInfoStepProps) {
  const selected = providers.find((p) => p.id === selectedProviderId) ?? null;

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search providers..."
          className="pl-9 min-h-11"
          value={providerSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search providers"
        />
      </div>

      {filteredProviders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {providers.length === 0
            ? "No providers available. Check system configuration."
            : "No providers match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((p) => {
            const isSelected = selectedProviderId === p.id;
            const categoryStyles = getProviderCategoryStyles(p.category);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectProvider(p.id)}
                className={cn(
                  "rounded-xl border p-5 min-h-[9rem] flex flex-col gap-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary-subtle ring-2 ring-primary/15 shadow-sm"
                    : "border-border/60 bg-card/80 hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <ProviderLogo
                    code={p.code}
                    name={p.name}
                    category={p.category}
                    size={48}
                    logoClassName={categoryStyles.logoBg}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <span className={cn("inline-flex mt-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", categoryStyles.badge)}>
                      {p.category.toLowerCase()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{formatCapabilities(p.capabilities)}</p>
                {p.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
      <FieldError message={providerError} />

      {selected && (
        <div className="p-6 rounded-xl border border-border/60 bg-card/80 space-y-4 max-w-3xl">
          <div className="flex items-start gap-4">
            <ProviderLogo code={selected.code} name={selected.name} category={selected.category} size={56} />
            <div>
              <h3 className="font-semibold text-lg">{selected.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{selected.description}</p>
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Provider code</dt>
              <dd className="font-mono font-medium mt-1">{selected.code.toUpperCase()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Category</dt>
              <dd className="font-medium mt-1 capitalize">{selected.category.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Version</dt>
              <dd className="font-medium mt-1">{selected.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Authentication</dt>
              <dd className="font-medium mt-1">{getProviderAuthMethod(selected.code)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Capabilities</dt>
              <dd className="font-medium mt-1">{formatCapabilities(selected.capabilities)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
