"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function SapAuthSetup({ configuration, onChange, errors }: ProviderAuthSetupProps) {
  const authMethod = configuration.authMethod ?? "basic";

  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title="SAP system connection" description="Connect to SAP S/4HANA or SAP ERP via OData services.">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input id="baseUrl" type="url" placeholder="https://sap.company.com:443" value={configuration.baseUrl ?? ""} onChange={(e) => onChange("baseUrl", e.target.value)} aria-invalid={!!errors.baseUrl} />
          <FieldError message={errors.baseUrl} />
        </div>
        <div className="space-y-2">
          <Label>Authentication method</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(["basic", "oauth", "client_credentials"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={authMethod === m}
                onClick={() => onChange("authMethod", m)}
                className={cn(
                  "p-3 rounded-lg border text-left text-sm transition-all",
                  authMethod === m ? "border-primary bg-primary-subtle ring-2 ring-primary/15" : "border-border hover:border-primary/30"
                )}
              >
                {m === "basic" ? "Basic Auth" : m === "oauth" ? "OAuth 2.0" : "Client Credentials"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select value={configuration.environment ?? ""} onValueChange={(v) => v && onChange("environment", v)}>
            <SelectTrigger id="environment"><SelectValue placeholder="Select environment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.environment} />
        </div>
        {authMethod === "basic" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Input id="clientId" value={configuration.clientId ?? ""} onChange={(e) => onChange("clientId", e.target.value)} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={configuration.username ?? ""} onChange={(e) => onChange("username", e.target.value)} aria-invalid={!!errors.username} />
              <FieldError message={errors.username} />
            </div>
            <div className="sm:col-span-2">
              <SecretInput id="password" label="Password" value={configuration.password ?? ""} onChange={(v) => onChange("password", v)} error={errors.password} />
            </div>
          </div>
        )}
        {(authMethod === "oauth" || authMethod === "client_credentials") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input id="clientId" value={configuration.clientId ?? ""} onChange={(e) => onChange("clientId", e.target.value)} aria-invalid={!!errors.clientId} />
              <FieldError message={errors.clientId} />
            </div>
            <SecretInput id="clientSecret" label="Client Secret" value={configuration.clientSecret ?? ""} onChange={(v) => onChange("clientSecret", v)} error={errors.clientSecret} />
          </div>
        )}
      </SetupSection>
    </div>
  );
}

export function NetSuiteAuthSetup({ configuration, onChange, errors }: ProviderAuthSetupProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title="NetSuite Token-Based Authentication" description="Use TBA credentials from NetSuite Integration record.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="accountId">Account ID</Label>
            <Input id="accountId" placeholder="TSTDRV1234567" className="font-mono" value={configuration.accountId ?? ""} onChange={(e) => onChange("accountId", e.target.value)} aria-invalid={!!errors.accountId} />
            <FieldError message={errors.accountId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input id="consumerKey" className="font-mono" value={configuration.consumerKey ?? ""} onChange={(e) => onChange("consumerKey", e.target.value)} aria-invalid={!!errors.consumerKey} />
            <FieldError message={errors.consumerKey} />
          </div>
          <SecretInput id="consumerSecret" label="Consumer Secret" value={configuration.consumerSecret ?? ""} onChange={(v) => onChange("consumerSecret", v)} error={errors.consumerSecret} />
          <div className="space-y-2">
            <Label htmlFor="tokenId">Token ID</Label>
            <Input id="tokenId" className="font-mono" value={configuration.tokenId ?? ""} onChange={(e) => onChange("tokenId", e.target.value)} aria-invalid={!!errors.tokenId} />
            <FieldError message={errors.tokenId} />
          </div>
          <SecretInput id="tokenSecret" label="Token Secret" value={configuration.tokenSecret ?? ""} onChange={(v) => onChange("tokenSecret", v)} error={errors.tokenSecret} />
        </div>
      </SetupSection>
    </div>
  );
}
