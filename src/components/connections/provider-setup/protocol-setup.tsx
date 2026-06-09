"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/wizard/field-error";
import { SecretInput } from "./shared/secret-input";
import { SetupSection } from "./shared/setup-section";
import type { ProviderAuthSetupProps } from "@/lib/provider-connection/types";
import { cn } from "@/lib/utils";

export function RestAuthSetup({ configuration, onChange, errors }: ProviderAuthSetupProps) {
  const authType = configuration.authType ?? "none";

  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title="REST API connection" description="Configure HTTP endpoint and authentication for REST integrations.">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input id="baseUrl" type="url" placeholder="https://api.example.com/v1" value={configuration.baseUrl ?? ""} onChange={(e) => onChange("baseUrl", e.target.value)} aria-invalid={!!errors.baseUrl} />
          <FieldError message={errors.baseUrl} />
        </div>
        <div className="space-y-2">
          <Label>Authentication</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(["none", "apikey", "bearer", "basic", "oauth2"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={authType === t} onClick={() => onChange("authType", t)}
                className={cn("p-2.5 rounded-lg border text-xs sm:text-sm capitalize", authType === t ? "border-primary bg-primary-subtle" : "border-border")}>
                {t === "apikey" ? "API Key" : t === "oauth2" ? "OAuth 2.0" : t === "bearer" ? "Bearer Token" : t}
              </button>
            ))}
          </div>
        </div>
        {authType === "apikey" && (
          <SecretInput id="apiKey" label="API Key" value={configuration.apiKey ?? ""} onChange={(v) => onChange("apiKey", v)} error={errors.apiKey} description="Sent as X-API-Key header by default" />
        )}
        {authType === "bearer" && (
          <SecretInput id="bearerToken" label="Bearer Token" value={configuration.bearerToken ?? ""} onChange={(v) => onChange("bearerToken", v)} error={errors.bearerToken} />
        )}
        {authType === "basic" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={configuration.username ?? ""} onChange={(e) => onChange("username", e.target.value)} aria-invalid={!!errors.username} />
              <FieldError message={errors.username} />
            </div>
            <SecretInput id="password" label="Password" value={configuration.password ?? ""} onChange={(v) => onChange("password", v)} error={errors.password} />
          </div>
        )}
        {authType === "oauth2" && (
          <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">OAuth 2.0 client credentials flow will be configured after connection validation.</p>
        )}
      </SetupSection>
      <SetupSection title="Default request options" description="Optional headers and query parameters applied to all requests.">
        <div className="space-y-2">
          <Label htmlFor="defaultHeaders">Default headers (JSON)</Label>
          <Textarea id="defaultHeaders" rows={3} placeholder='{"Accept": "application/json"}' className="font-mono text-xs" value={configuration.defaultHeaders ?? ""} onChange={(e) => onChange("defaultHeaders", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultQueryParams">Default query parameters (JSON)</Label>
          <Textarea id="defaultQueryParams" rows={2} placeholder='{"version": "2"}' className="font-mono text-xs" value={configuration.defaultQueryParams ?? ""} onChange={(e) => onChange("defaultQueryParams", e.target.value)} />
        </div>
      </SetupSection>
    </div>
  );
}

export function WebhookAuthSetup({ configuration, onChange, errors }: ProviderAuthSetupProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title="Webhook receiver configuration" description="Configure inbound webhook endpoint and signature verification.">
        <div className="space-y-2">
          <Label htmlFor="targetUrl">Endpoint URL</Label>
          <Input id="targetUrl" type="url" placeholder="https://hooks.commerceone.io/tenant/abc123" value={configuration.targetUrl ?? ""} onChange={(e) => onChange("targetUrl", e.target.value)} aria-invalid={!!errors.targetUrl} />
          <FieldError message={errors.targetUrl} />
        </div>
        <SecretInput id="secret" label="Signing secret" value={configuration.secret ?? ""} onChange={(v) => onChange("secret", v)} error={errors.secret} description="Used to verify webhook payload signatures" />
        <div className="space-y-2">
          <Label htmlFor="signingAlgorithm">Signature algorithm</Label>
          <Select value={configuration.signingAlgorithm ?? ""} onValueChange={(v) => v && onChange("signingAlgorithm", v)}>
            <SelectTrigger id="signingAlgorithm"><SelectValue placeholder="Select algorithm" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hmac-sha256">HMAC SHA256</SelectItem>
              <SelectItem value="hmac-sha1">HMAC SHA1</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.signingAlgorithm} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customHeaders">Custom headers (JSON, optional)</Label>
          <Textarea id="customHeaders" rows={2} placeholder='{"X-Custom-Header": "value"}' className="font-mono text-xs" value={configuration.customHeaders ?? ""} onChange={(e) => onChange("customHeaders", e.target.value)} />
        </div>
      </SetupSection>
    </div>
  );
}
