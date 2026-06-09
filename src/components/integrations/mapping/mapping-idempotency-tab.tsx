"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { flattenSchemaFields } from "@/lib/mapping/schema-utils";
import {
  buildIdempotencyFieldToken,
  buildIdempotencyPreviewFromTemplate,
  formatIdempotencyTokenLabel,
  isSystemIdempotencyToken,
} from "@/lib/mapping/idempotency-utils";
import { IDEMPOTENCY_TOKENS, mergeIdempotency } from "@/lib/integration-runtime-defaults";
import type { IntegrationIdempotencyConfig } from "@/types/domain";
import type { SchemaField } from "@/types/mapping";
import { Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface MappingIdempotencyTabProps {
  value?: IntegrationIdempotencyConfig;
  onChange: (value: IntegrationIdempotencyConfig) => void;
  previewContext: {
    tenantId: string;
    integrationId: string;
    dataFlowCode?: string;
  };
  sourceSchema?: SchemaField[];
  destinationSchema?: SchemaField[];
  readOnly?: boolean;
}

export function MappingIdempotencyTab({
  value,
  onChange,
  previewContext,
  sourceSchema = [],
  destinationSchema = [],
  readOnly = false,
}: MappingIdempotencyTabProps) {
  const idempotency = mergeIdempotency(value);

  const sourceFields = useMemo(() => flattenSchemaFields(sourceSchema), [sourceSchema]);
  const destinationFields = useMemo(() => flattenSchemaFields(destinationSchema), [destinationSchema]);

  const preview = useMemo(
    () =>
      buildIdempotencyPreviewFromTemplate(
        idempotency.keyTemplate,
        {
          tenant_id: previewContext.tenantId.slice(0, 8),
          integration_id: previewContext.integrationId.slice(0, 8),
          execution_id: "exec_0042",
          source_connection_id: "src_conn_01",
          destination_connection_id: "dest_conn_02",
          data_flow_code: previewContext.dataFlowCode ?? "orders_outbound",
          source_reference_id: "SO-20240516-001",
          file_name: "orders.csv",
          record_id: "rec_9912",
        },
        sourceFields,
        destinationFields
      ),
    [destinationFields, idempotency.keyTemplate, previewContext, sourceFields]
  );

  const patch = (patch: Partial<IntegrationIdempotencyConfig>) => {
    if (readOnly) return;
    onChange({ ...idempotency, ...patch });
  };

  const toggleToken = (token: string, selected: boolean) => {
    const current = idempotency.keyTemplate;
    patch({
      keyTemplate: selected ? [...current, token] : current.filter((t) => t !== token),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-muted-foreground" />
            Idempotency key
          </CardTitle>
          <CardDescription>
            Prevent duplicate processing when the same source record is delivered more than once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>Idempotency enabled</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reject or skip records that match an existing idempotency key.
              </p>
            </div>
            <Switch
              checked={idempotency.enabled}
              disabled={readOnly}
              onCheckedChange={(enabled) => patch({ enabled })}
            />
          </div>

          {idempotency.enabled && (
            <>
              <TokenGroup
                title="System tokens"
                description="Platform identifiers and runtime context."
                readOnly={readOnly}
                tokens={IDEMPOTENCY_TOKENS.map((token) => ({
                  token,
                  label: token,
                  variant: "system" as const,
                }))}
                selected={idempotency.keyTemplate}
                onToggle={toggleToken}
              />

              {sourceFields.length > 0 && (
                <TokenGroup
                  title="Source fields"
                  description="Fields from the source schema included in the key."
                  readOnly={readOnly}
                  tokens={sourceFields.map((field) => ({
                    token: buildIdempotencyFieldToken("source", field.path),
                    label: field.path,
                    variant: "source" as const,
                  }))}
                  selected={idempotency.keyTemplate}
                  onToggle={toggleToken}
                />
              )}

              {destinationFields.length > 0 && (
                <TokenGroup
                  title="Destination fields"
                  description="Fields from the destination schema included in the key."
                  readOnly={readOnly}
                  tokens={destinationFields.map((field) => ({
                    token: buildIdempotencyFieldToken("destination", field.path),
                    label: field.path,
                    variant: "destination" as const,
                  }))}
                  selected={idempotency.keyTemplate}
                  onToggle={toggleToken}
                />
              )}

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Template
                  </p>
                  <p className="font-mono text-sm mt-1">
                    {idempotency.keyTemplate.length > 0
                      ? idempotency.keyTemplate.map(formatIdempotencyTokenLabel).join(" + ")
                      : "Select tokens or fields above"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Preview
                  </p>
                  <p className="font-mono text-sm text-primary mt-1">{preview}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TokenGroup({
  title,
  description,
  tokens,
  selected,
  onToggle,
  readOnly,
}: {
  title: string;
  description: string;
  tokens: Array<{ token: string; label: string; variant: "system" | "source" | "destination" }>;
  selected: string[];
  onToggle: (token: string, active: boolean) => void;
  readOnly?: boolean;
}) {
  const variantClass = {
    system: {
      selected: "border-primary bg-primary-subtle text-primary",
      idle: "border-border text-muted-foreground hover:border-primary/40",
    },
    source: {
      selected: "border-info-subtle-foreground/40 bg-info-subtle text-info-subtle-foreground",
      idle: "border-border text-muted-foreground hover:border-info-subtle-foreground/40",
    },
    destination: {
      selected: "border-success-subtle-foreground/40 bg-success-subtle text-success-subtle-foreground",
      idle: "border-border text-muted-foreground hover:border-success-subtle-foreground/40",
    },
  };

  return (
    <div className="space-y-2">
      <div>
        <Label>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.map(({ token, label, variant }) => {
          const isSelected = selected.includes(token);
          return (
            <button
              key={token}
              type="button"
              disabled={readOnly}
              onClick={() => onToggle(token, !isSelected)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-mono transition-colors",
                isSelected ? variantClass[variant].selected : variantClass[variant].idle,
                readOnly && "opacity-70 cursor-default"
              )}
            >
              {isSystemIdempotencyToken(token) ? label : `${variant === "source" ? "source" : "destination"}.${label}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
