"use client";

import Link from "next/link";
import { MappingContextSummary } from "@/components/integrations/mapping/mapping-context-summary";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/wizard/field-error";
import { ConnectionPicker } from "@/components/integrations/connection-picker";
import { DataFlowPicker } from "@/components/integrations/data-flow-picker";
import type { IntegrationFormContext } from "@/lib/integration-wizard/use-integration-form";
import type { Integration } from "@/types/domain";
import { TriggerType } from "@/types/enums";
import { Clock, Globe, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

const TRIGGER_ICONS = {
  [TriggerType.SCHEDULE]: Clock,
  [TriggerType.WEBHOOK]: Webhook,
  [TriggerType.API]: Globe,
} as const;

interface SectionProps {
  ctx: IntegrationFormContext;
  tenantId: string;
  readOnlyCode?: boolean;
}

export function IntegrationGeneralSection({ ctx, readOnlyCode = false }: SectionProps) {
  const { register, errors } = ctx;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">General information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Integration code</Label>
            <Input
              id="code"
              placeholder="INT-SHOPEE-SAP"
              className="font-mono uppercase"
              maxLength={32}
              readOnly={readOnlyCode}
              aria-invalid={!!errors.code}
              {...register("code", {
                onChange: (e) => {
                  if (!readOnlyCode) e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
            <FieldError message={errors.code?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Integration name</Label>
            <Input id="name" placeholder="Shopee Orders to SAP" maxLength={120} aria-invalid={!!errors.name} {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Syncs new orders from Shopee to SAP every 15 minutes" maxLength={500} rows={3} {...register("description")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="production, orders, shopee" {...register("tags")} />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" placeholder="Integration Team" {...register("owner")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationTriggerSection({ ctx, tenantId }: SectionProps) {
  const { values, setValue, getValues, selectedDataFlow, isFileSource, triggerOptions } = ctx;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {triggerOptions.map(({ type, label, description }) => {
              const Icon = TRIGGER_ICONS[type];
              const selected = values.triggerType === type;
              const disabled = selectedDataFlow ? !selectedDataFlow.supportedTriggers.includes(type) : false;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => setValue("triggerType", type, { shouldValidate: true })}
                  className={cn(
                    "p-6 rounded-xl border text-left flex flex-col gap-3 min-h-36 transition-all",
                    disabled && "opacity-40 cursor-not-allowed",
                    selected ? "border-primary bg-primary-subtle ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {values.triggerType === TriggerType.SCHEDULE && (
        <Card>
          <CardHeader><CardTitle className="text-base">Schedule configuration</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cron expression</Label>
              <Input defaultValue={values.triggerConfig?.cron} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), cron: e.target.value })} placeholder="0 */15 * * * *" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input defaultValue={values.triggerConfig?.timezone} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), timezone: e.target.value })} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
              <Label>Enabled</Label>
              <Switch checked={values.triggerConfig?.enabled ?? true} onCheckedChange={(v) => setValue("triggerConfig", { ...getValues("triggerConfig"), enabled: v })} />
            </div>
            {isFileSource && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                  <Label>Polling mode</Label>
                  <Switch checked={values.triggerConfig?.pollingMode ?? false} onCheckedChange={(v) => setValue("triggerConfig", { ...getValues("triggerConfig"), pollingMode: v })} />
                </div>
                <div className="space-y-2"><Label>Polling directory / prefix</Label><Input defaultValue={values.triggerConfig?.pollingDirectory} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), pollingDirectory: e.target.value })} placeholder="/inbound/orders" /></div>
                <div className="space-y-2"><Label>File pattern</Label><Input defaultValue={values.triggerConfig?.filePattern} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), filePattern: e.target.value })} placeholder="*.csv" /></div>
                <div className="space-y-2"><Label>Processed folder</Label><Input defaultValue={values.triggerConfig?.processedFolder} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), processedFolder: e.target.value })} placeholder="/processed" /></div>
                <div className="space-y-2"><Label>Error folder</Label><Input defaultValue={values.triggerConfig?.errorFolder} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), errorFolder: e.target.value })} placeholder="/error" /></div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {values.triggerType === TriggerType.WEBHOOK && (
        <Card>
          <CardHeader><CardTitle className="text-base">Webhook configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Generated webhook URL</Label>
              <Input readOnly className="font-mono text-xs bg-muted/50" value={`https://hooks.commerceone.io/${tenantId}/${values.code.toLowerCase() || "integration"}`} />
            </div>
            <div className="space-y-2"><Label>Signing secret</Label><Input type="password" defaultValue={values.triggerConfig?.signingSecret as string | undefined} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), signingSecret: e.target.value })} /></div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label>Signature verification</Label>
              <Switch checked={values.triggerConfig?.signatureVerification ?? true} onCheckedChange={(v) => setValue("triggerConfig", { ...getValues("triggerConfig"), signatureVerification: v })} />
            </div>
            <div className="space-y-2"><Label>Allowed IPs (optional)</Label><Input defaultValue={values.triggerConfig?.allowedIps as string | undefined} placeholder="203.0.113.0/24, 198.51.100.1" onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), allowedIps: e.target.value })} /></div>
          </CardContent>
        </Card>
      )}

      {values.triggerType === TriggerType.API && (
        <Card>
          <CardHeader><CardTitle className="text-base">API trigger configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Generated API endpoint</Label>
              <Input readOnly className="font-mono text-xs bg-muted/50" value={`https://api.commerceone.io/v1/integrations/${values.code.toLowerCase() || "integration"}/run`} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label>API key required</Label>
              <Switch checked={values.triggerConfig?.apiKeyRequired ?? true} onCheckedChange={(v) => setValue("triggerConfig", { ...getValues("triggerConfig"), apiKeyRequired: v })} />
            </div>
            <div className="space-y-2"><Label>Allowed methods</Label><Input defaultValue={values.triggerConfig?.allowedMethods ?? "POST"} onChange={(e) => setValue("triggerConfig", { ...getValues("triggerConfig"), allowedMethods: e.target.value })} /></div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label>Manual run enabled</Label>
              <Switch checked={values.triggerConfig?.manualRunEnabled ?? true} onCheckedChange={(v) => setValue("triggerConfig", { ...getValues("triggerConfig"), manualRunEnabled: v })} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function IntegrationConnectionsSection({ ctx, tenantId }: SectionProps) {
  const {
    errors,
    sourceOptions,
    providerMap,
    values,
    selectSource,
    sourceProvider,
    sourceDataFlows,
    selectDataFlow,
    selectedDataFlow,
    destOptions,
    setValue,
  } = ctx;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Source connection</CardTitle>
          <p className="text-sm text-muted-foreground">Select the connection this integration reads data from.</p>
        </CardHeader>
        <CardContent>
          <ConnectionPicker
            connections={sourceOptions}
            providerMap={providerMap}
            selectedId={values.sourceConnectionId}
            onSelect={selectSource}
            emptyMessage="No source-compatible connections available."
          />
          <FieldError message={errors.sourceConnectionId?.message} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose what data to extract from {sourceProvider?.name ?? "the selected source"}.
          </p>
        </CardHeader>
        <CardContent>
          <DataFlowPicker
            dataFlows={sourceDataFlows}
            selectedId={values.dataFlowId}
            onSelect={selectDataFlow}
            providerName={sourceProvider?.name ?? "Source"}
          />
          <FieldError message={errors.dataFlowId?.message} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destination connection</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedDataFlow
              ? `Compatible destinations for ${selectedDataFlow.name}: ${selectedDataFlow.supportedDestinationCategories.join(", ")}`
              : "Select a destination connection."}
          </p>
        </CardHeader>
        <CardContent>
          {destOptions.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">No compatible destination connection found.</p>
              <Link href={`/tenants/${tenantId}/connections/new`}>
                <Button type="button" variant="outline">Create destination connection</Button>
              </Link>
            </div>
          ) : (
            <ConnectionPicker
              connections={destOptions}
              providerMap={providerMap}
              selectedId={values.destinationConnectionId}
              onSelect={(id) => setValue("destinationConnectionId", id, { shouldValidate: true })}
              emptyMessage="No compatible destinations."
            />
          )}
          <FieldError message={errors.destinationConnectionId?.message} />
        </CardContent>
      </Card>
    </div>
  );
}

export function IntegrationEditOverviewSection({
  integration,
  ctx,
}: {
  integration: Integration;
  ctx: IntegrationFormContext;
}) {
  const { values, sourceConn, destConn, sourceProvider, destProvider, selectedDataFlow, suggested } = ctx;
  const mappingTemplateCode = values.mappingProfileCode ?? suggested.mappingTemplateCode;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration details</CardTitle>
          <p className="text-sm text-muted-foreground">
            General settings are fixed after creation. Use Trigger and Mapping tabs to update runtime behavior.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Integration code</Label>
              <Input readOnly value={integration.code} className="font-mono bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input readOnly value={integration.name} className="bg-muted/50" />
            </div>
          </div>
          {integration.description && (
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea readOnly value={integration.description} rows={2} className="bg-muted/50 resize-none" />
            </div>
          )}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">Status</dt>
              <dd className="mt-1"><StatusBadge status={integration.status} /></dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">Trigger</dt>
              <dd className="font-medium mt-1">{integration.triggerType}</dd>
            </div>
            {integration.tags && integration.tags.length > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Tags</dt>
                <dd className="font-medium mt-1">{integration.tags.join(", ")}</dd>
              </div>
            )}
            {integration.owner && (
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Owner</dt>
                <dd className="font-medium mt-1">{integration.owner}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Source, data flow, and destination are configured at creation and cannot be changed here.
          </p>
        </CardHeader>
        <CardContent>
          <MappingContextSummary
            sourceProvider={sourceProvider}
            sourceConnection={sourceConn}
            dataFlow={selectedDataFlow}
            destinationProvider={destProvider}
            destinationConnection={destConn}
            templateCode={mappingTemplateCode}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function IntegrationProfilesSummary({ ctx, status }: { ctx: IntegrationFormContext; status?: string }) {
  const { values, sourceConn, destConn, selectedDataFlow, suggested } = ctx;
  const mappingTemplateCode = values.mappingProfileCode ?? suggested.mappingTemplateCode;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Applied profiles</CardTitle>
        <p className="text-sm text-muted-foreground">Automatically resolved from your source, data flow, and destination.</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Status</dt><dd className="font-medium mt-1">{status ?? "Draft"}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Trigger</dt><dd className="font-medium mt-1">{values.triggerType}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Source</dt><dd className="font-medium mt-1">{sourceConn?.name ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Data flow</dt><dd className="font-medium mt-1">{selectedDataFlow?.name ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Destination</dt><dd className="font-medium mt-1">{destConn?.name ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Mapping</dt><dd className="font-mono font-medium mt-1 text-xs">{mappingTemplateCode}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Validation</dt><dd className="font-mono font-medium mt-1 text-xs">{suggested.validationProfileCode}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Transformation</dt><dd className="font-mono font-medium mt-1 text-xs">{suggested.transformationProfileCode}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Execution policy</dt><dd className="font-mono font-medium mt-1 text-xs">{suggested.executionPolicyCode}</dd></div>
          <div><dt className="text-muted-foreground text-xs uppercase tracking-wide">Retry policy</dt><dd className="font-mono font-medium mt-1 text-xs">{suggested.retryPolicyCode}</dd></div>
        </dl>
      </CardContent>
    </Card>
  );
}
