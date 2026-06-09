"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { generateSigningSecret } from "@/lib/integration-runtime-defaults";
import type { IntegrationFormContext } from "@/lib/integration-wizard/use-integration-form";
import type { CreateIntegrationInput } from "@/lib/schemas/integration.schema";
import { TriggerType } from "@/types/enums";
import { Clock, Copy, Globe, RefreshCw, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

const TRIGGER_OPTIONS = [
  {
    type: TriggerType.SCHEDULE,
    label: "Schedule",
    description: "Run automatically on a cron schedule.",
    icon: Clock,
  },
  {
    type: TriggerType.WEBHOOK,
    label: "Webhook",
    description: "Trigger when an inbound HTTP event is received.",
    icon: Webhook,
  },
  {
    type: TriggerType.API,
    label: "API",
    description: "Trigger by manual or external REST API call.",
    icon: Globe,
  },
] as const;

interface IntegrationTriggerEditSectionProps {
  ctx: IntegrationFormContext;
  tenantId: string;
}

type TriggerConfig = NonNullable<CreateIntegrationInput["triggerConfig"]>;

export function IntegrationTriggerEditSection({ ctx, tenantId }: IntegrationTriggerEditSectionProps) {
  const { values, setValue, getValues, selectedDataFlow, isFileSource, triggerOptions } = ctx;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const patchTriggerConfig = useCallback(
    (patch: Partial<TriggerConfig>) => {
      setValue("triggerConfig", { ...getValues("triggerConfig"), ...patch }, { shouldDirty: true });
    },
    [getValues, setValue]
  );

  const triggerConfig = values.triggerConfig ?? {};

  const webhookUrl =
    triggerConfig.webhookUrl ??
    `https://hooks.commerceone.io/${tenantId}/${values.code.toLowerCase() || "integration"}`;
  const apiEndpoint =
    triggerConfig.apiEndpoint ??
    `https://api.commerceone.io/v1/integrations/${values.code.toLowerCase() || "integration"}/run`;

  const allowedIpsText = Array.isArray(triggerConfig.allowedIps)
    ? triggerConfig.allowedIps.join(", ")
    : (triggerConfig.allowedIps ?? "");
  const allowedMethodsText = Array.isArray(triggerConfig.allowedMethods)
    ? triggerConfig.allowedMethods.join(", ")
    : String(triggerConfig.allowedMethods ?? "POST");

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger type</CardTitle>
          <CardDescription>Choose how this integration is started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {triggerOptions.map(({ type, label, description }) => {
              const option = TRIGGER_OPTIONS.find((o) => o.type === type);
              const Icon = option?.icon ?? Clock;
              const selected = values.triggerType === type;
              const disabled = selectedDataFlow
                ? !selectedDataFlow.supportedTriggers.includes(type)
                : false;
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
                    selected
                      ? "border-primary bg-primary-subtle ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger configuration</CardTitle>
          <CardDescription>Settings specific to the selected trigger type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {values.triggerType === TriggerType.SCHEDULE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cronExpression">Cron expression</Label>
                <Input
                  id="cronExpression"
                  value={triggerConfig.cronExpression ?? triggerConfig.cron ?? ""}
                  onChange={(e) => patchTriggerConfig({ cronExpression: e.target.value })}
                  placeholder="0 */15 * * * *"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">How often the integration runs.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={triggerConfig.timezone ?? "Asia/Bangkok"}
                  onChange={(e) => patchTriggerConfig({ timezone: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                <div>
                  <Label>Enabled</Label>
                  <p className="text-xs text-muted-foreground">Pause scheduled runs without deleting the integration.</p>
                </div>
                <Switch
                  checked={triggerConfig.enabled ?? true}
                  onCheckedChange={(v) => patchTriggerConfig({ enabled: v })}
                />
              </div>
              {isFileSource && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                    <div>
                      <Label>Polling mode</Label>
                      <p className="text-xs text-muted-foreground">Poll file sources on the schedule above.</p>
                    </div>
                    <Switch
                      checked={triggerConfig.pollingMode ?? false}
                      onCheckedChange={(v) => patchTriggerConfig({ pollingMode: v })}
                    />
                  </div>
                  {triggerConfig.pollingMode && (
                    <>
                      <div className="space-y-2">
                        <Label>Source directory / prefix</Label>
                        <Input
                          value={triggerConfig.sourcePath ?? ""}
                          onChange={(e) => patchTriggerConfig({ sourcePath: e.target.value })}
                          placeholder="/inbound/orders"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>File pattern</Label>
                        <Input
                          value={triggerConfig.filePattern ?? ""}
                          onChange={(e) => patchTriggerConfig({ filePattern: e.target.value })}
                          placeholder="*.csv"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Processed folder</Label>
                        <Input
                          value={triggerConfig.processedPath ?? ""}
                          onChange={(e) => patchTriggerConfig({ processedPath: e.target.value })}
                          placeholder="/processed/orders"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Error folder</Label>
                        <Input
                          value={triggerConfig.errorPath ?? ""}
                          onChange={(e) => patchTriggerConfig({ errorPath: e.target.value })}
                          placeholder="/error/orders"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {values.triggerType === TriggerType.WEBHOOK && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated webhook URL</Label>
                <div className="flex gap-2">
                  <Input readOnly className="font-mono text-xs bg-muted/50" value={webhookUrl} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl, "webhookUrl")}
                    aria-label="Copy webhook URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedField === "webhookUrl" && (
                  <p className="text-xs text-success-subtle-foreground">Copied to clipboard.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Signing secret</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={triggerConfig.signingSecret ?? ""}
                    onChange={(e) => patchTriggerConfig({ signingSecret: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => patchTriggerConfig({ signingSecret: generateSigningSecret() })}
                    aria-label="Regenerate signing secret"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Signature verification</Label>
                <Switch
                  checked={triggerConfig.signatureVerificationEnabled ?? true}
                  onCheckedChange={(v) => patchTriggerConfig({ signatureVerificationEnabled: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed IPs</Label>
                <Input
                  value={allowedIpsText}
                  onChange={(e) =>
                    patchTriggerConfig({
                      allowedIps: e.target.value
                        .split(",")
                        .map((ip) => ip.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="203.0.113.0/24, 198.51.100.1"
                />
                <p className="text-xs text-muted-foreground">Optional. Comma-separated CIDR ranges or IPs.</p>
              </div>
            </div>
          )}

          {values.triggerType === TriggerType.API && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated API endpoint</Label>
                <div className="flex gap-2">
                  <Input readOnly className="font-mono text-xs bg-muted/50" value={apiEndpoint} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiEndpoint, "apiEndpoint")}
                    aria-label="Copy API endpoint"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedField === "apiEndpoint" && (
                  <p className="text-xs text-success-subtle-foreground">Copied to clipboard.</p>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>API key required</Label>
                <Switch
                  checked={triggerConfig.apiKeyRequired ?? true}
                  onCheckedChange={(v) => patchTriggerConfig({ apiKeyRequired: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed methods</Label>
                <Input
                  value={allowedMethodsText}
                  onChange={(e) =>
                    patchTriggerConfig({
                      allowedMethods: e.target.value
                        .split(",")
                        .map((m) => m.trim().toUpperCase())
                        .filter(Boolean),
                    })
                  }
                  placeholder="POST"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Manual run enabled</Label>
                  <p className="text-xs text-muted-foreground">Allow operators to trigger runs from the console.</p>
                </div>
                <Switch
                  checked={triggerConfig.manualRunEnabled ?? true}
                  onCheckedChange={(v) => patchTriggerConfig({ manualRunEnabled: v })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
