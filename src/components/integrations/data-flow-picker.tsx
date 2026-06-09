"use client";

import {
  Package,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Truck,
  RotateCcw,
  FileInput,
  Database,
  Webhook,
  Globe,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderDataFlow } from "@/types/domain";
import { CheckCircle2 } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ORDERS: ShoppingCart,
  ORDER_STATUS: ShoppingCart,
  PRODUCTS: Package,
  INVENTORY: Warehouse,
  PRICE: DollarSign,
  SHIPMENT: Truck,
  RETURNS: RotateCcw,
  PRODUCT_FILE_IMPORT: FileInput,
  INVENTORY_FILE_IMPORT: FileInput,
  PRICE_FILE_IMPORT: FileInput,
  ORDER_FILE_IMPORT: FileInput,
  SALES_ORDER: Database,
  PURCHASE_ORDER: Database,
  MATERIAL_MASTER: Package,
  CUSTOMER_MASTER: Database,
  GENERIC_EVENT: Webhook,
  ORDER_EVENT: Webhook,
  CUSTOM_API_RESOURCE: Globe,
  GENERIC_PAYLOAD: Layers,
};

interface DataFlowPickerProps {
  dataFlows: ProviderDataFlow[];
  selectedId: string;
  onSelect: (id: string) => void;
  providerName: string;
}

export function DataFlowPicker({ dataFlows, selectedId, onSelect, providerName }: DataFlowPickerProps) {
  if (dataFlows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No data flows configured for {providerName}. Contact your administrator.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dataFlows.map((flow) => {
        const Icon = ICON_MAP[flow.code] ?? Layers;
        const selected = selectedId === flow.id;
        return (
          <button
            key={flow.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(flow.id)}
            className={cn(
              "rounded-xl border p-5 text-left transition-all flex flex-col gap-3",
              selected
                ? "border-primary bg-primary-subtle ring-2 ring-primary/15 shadow-sm"
                : "border-border/60 bg-card/80 hover:border-primary/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{flow.name}</p>
                  {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </div>
                <span className="inline-flex mt-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-muted text-muted-foreground">
                  {flow.category}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{flow.description}</p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] pt-1 border-t border-border/40">
              <div>
                <dt className="text-muted-foreground uppercase tracking-wide">Triggers</dt>
                <dd className="font-medium mt-0.5">{flow.supportedTriggers.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground uppercase tracking-wide">Recommended</dt>
                <dd className="font-medium mt-0.5">{flow.recommendedTrigger}</dd>
              </div>
              {flow.defaultMappingTemplateCode && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground uppercase tracking-wide">Default mapping</dt>
                  <dd className="font-mono font-medium mt-0.5 text-[10px]">{flow.defaultMappingTemplateCode}</dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="text-muted-foreground uppercase tracking-wide">Destinations</dt>
                <dd className="font-medium mt-0.5">{flow.supportedDestinationCategories.join(" · ")}</dd>
              </div>
            </dl>
          </button>
        );
      })}
    </div>
  );
}
