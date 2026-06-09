"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/wizard/field-error";
import { OAuthConnectPanel } from "./shared/oauth-connect-panel";
import { SecretInput } from "./shared/secret-input";
import { SetupSection, FormGrid } from "./shared/setup-section";
import {
  buildMarketplaceAuthorizeUrl,
  getOAuthPopupUrl,
  storeOAuthState,
  storeOAuthPendingConfig,
  shouldUseMockMarketplaceOAuth,
  type MarketplaceProvider,
} from "@/lib/provider-connection/oauth";
import { openMarketplaceOAuthPopup } from "@/lib/provider-connection/oauth-popup";
import { canStartMarketplaceOAuth } from "@/lib/provider-connection/validate";
import {
  getMarketplaceCredentialKeys,
  hasMarketplaceCredentialDraft,
  pickMarketplaceCredentials,
} from "@/lib/provider-connection/marketplace-credentials";
import type { ProviderAuthSetupProps } from "@/lib/provider-connection/types";

const REGION_OPTIONS = [
  { label: "Thailand", value: "TH", currency: "THB" },
  { label: "Singapore", value: "SG", currency: "SGD" },
  { label: "Malaysia", value: "MY", currency: "MYR" },
  { label: "Indonesia", value: "ID", currency: "IDR" },
  { label: "Philippines", value: "PH", currency: "PHP" },
  { label: "Vietnam", value: "VN", currency: "VND" },
] as const;

const REGION_ITEMS = Object.fromEntries(
  REGION_OPTIONS.map((r) => [r.value, `${r.label} (${r.value})`])
);

const ENVIRONMENT_ITEMS = {
  production: "Production",
  sandbox: "Sandbox",
};

function RegionSelect({
  id,
  value,
  onValueChange,
  error,
  placeholder = "Select region",
}: {
  id: string;
  value: string;
  onValueChange: (region: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <>
      <Select
        modal={false}
        items={REGION_ITEMS}
        value={value || null}
        onValueChange={(v) => {
          if (v != null) onValueChange(String(v));
        }}
      >
        <SelectTrigger id={id} className="w-full min-h-11" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {REGION_OPTIONS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label} ({r.value})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </>
  );
}

function MarketplaceOAuthSetup({
  providerCode,
  providerName,
  authMethod,
  configuration,
  onChange,
  onBulkChange,
  errors,
  oauthConnected,
  mode = "create",
  onMarketplaceCredentialsChange,
}: ProviderAuthSetupProps & {
  providerCode: string;
  providerName: string;
  authMethod: string;
}) {
  const [connecting, setConnecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [externalOAuthUrl, setExternalOAuthUrl] = useState<string>("");
  const isEditMode = mode === "edit";
  const credentialKeys = getMarketplaceCredentialKeys(providerCode);
  const [credentialDraft, setCredentialDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(credentialKeys.map((key) => [key, ""]))
  );
  const credentialsDirty = isEditMode && hasMarketplaceCredentialDraft(providerCode, credentialDraft);

  const credentialValues = isEditMode ? credentialDraft : pickMarketplaceCredentials(providerCode, configuration);

  const effectiveConfiguration = useMemo(() => {
    if (!isEditMode) return configuration;
    if (!credentialsDirty) return configuration;
    return { ...configuration, ...credentialDraft };
  }, [configuration, credentialDraft, credentialsDirty, isEditMode]);

  const credentialsReady = credentialsDirty
    ? canStartMarketplaceOAuth(providerCode, credentialDraft)
    : canStartMarketplaceOAuth(providerCode, configuration);
  const isOAuthConnected =
    (oauthConnected ?? configuration.oauthConnected === "true") && !credentialsDirty;

  useEffect(() => {
    if (!isEditMode) return;
    onMarketplaceCredentialsChange?.(credentialDraft, credentialsDirty);
  }, [credentialDraft, credentialsDirty, isEditMode, onMarketplaceCredentialsChange]);

  const updateCredential = (key: string, value: string) => {
    if (isEditMode) {
      const nextDraft = { ...credentialDraft, [key]: value };
      setCredentialDraft(nextDraft);
      if (hasMarketplaceCredentialDraft(providerCode, nextDraft)) {
        onBulkChange({ oauthConnected: "false" });
      }
      return;
    }
    onChange(key, value);
  };

  const updateCredentials = (patch: Record<string, string>) => {
    if (isEditMode) {
      const nextDraft = { ...credentialDraft, ...patch };
      setCredentialDraft(nextDraft);
      if (hasMarketplaceCredentialDraft(providerCode, nextDraft)) {
        onBulkChange({ oauthConnected: "false" });
      }
      return;
    }
    onBulkChange(patch);
  };

  useEffect(() => {
    if (!credentialsReady) {
      setExternalOAuthUrl("");
      return;
    }
    let cancelled = false;
    const configSnapshot = JSON.stringify(effectiveConfiguration);
    void buildMarketplaceAuthorizeUrl(
      providerCode as MarketplaceProvider,
      JSON.parse(configSnapshot) as Record<string, string>,
      window.location.origin
    ).then(({ authorizeUrl }) => {
      if (!cancelled) setExternalOAuthUrl(authorizeUrl);
    });
    return () => { cancelled = true; };
  }, [providerCode, credentialsReady, effectiveConfiguration]);

  const handleConnect = async () => {
    if (!credentialsReady) return;
    setConnecting(true);
    setOauthError(null);
    try {
      const built = await buildMarketplaceAuthorizeUrl(
        providerCode as MarketplaceProvider,
        effectiveConfiguration,
        window.location.origin
      );
      setExternalOAuthUrl(built.authorizeUrl);
      storeOAuthState(providerCode, built.state);
      storeOAuthPendingConfig(providerCode, effectiveConfiguration);

      const tokens = await openMarketplaceOAuthPopup(getOAuthPopupUrl(built));
      if (isEditMode && credentialsDirty) {
        onBulkChange({ ...credentialDraft, ...tokens, oauthConnected: "true" });
        setCredentialDraft(Object.fromEntries(credentialKeys.map((key) => [key, ""])));
      } else {
        onBulkChange(tokens);
      }
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : "Authorization failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleRegionChange = (region: string) => {
    const match = REGION_OPTIONS.find((r) => r.value === region);
    if (providerCode === "lazada" && match) {
      updateCredentials({
        region,
        defaultCountry: region,
        defaultCurrency: match.currency,
      });
    } else {
      updateCredential("region", region);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <SetupSection
        title="Partner application credentials"
        description={
          isEditMode
            ? `Credentials are hidden for security. Enter new ${providerName} app credentials to update and re-authorize.`
            : `Enter your ${providerName} developer app credentials before authorizing.`
        }
      >
        {providerCode === "shopee" && (
          <FormGrid>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="partnerId">Shopee Partner ID</Label>
              <Input
                id="partnerId"
                placeholder="2012345"
                className="font-mono"
                value={credentialValues.partnerId ?? ""}
                onChange={(e) => updateCredential("partnerId", e.target.value)}
                aria-invalid={!!errors.partnerId}
              />
              <FieldError message={errors.partnerId} />
            </div>
            <div className="sm:col-span-2">
              <SecretInput
                id="partnerKey"
                label="Shopee Partner Key"
                value={credentialValues.partnerKey ?? ""}
                onChange={(v) => updateCredential("partnerKey", v)}
                error={errors.partnerKey}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account type</Label>
              <Select
                modal={false}
                value={credentialValues.accountType ?? "erp"}
                onValueChange={(v) => { if (v != null) updateCredential("accountType", String(v)); }}
              >
                <SelectTrigger id="accountType" className="w-full min-h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="erp">ERP</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Near country</Label>
              <RegionSelect
                id="region"
                value={credentialValues.region ?? ""}
                onValueChange={handleRegionChange}
                error={errors.region}
                placeholder="Select country"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 sm:col-span-2">
              <div>
                <Label htmlFor="testMode">Test mode (CSMI)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Use Shopee sandbox environment</p>
              </div>
              <Switch
                id="testMode"
                checked={credentialValues.testMode === "true"}
                onCheckedChange={(v) => updateCredential("testMode", String(v))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                modal={false}
                items={ENVIRONMENT_ITEMS}
                value={credentialValues.environment || null}
                onValueChange={(v) => { if (v != null) updateCredential("environment", String(v)); }}
              >
                <SelectTrigger id="environment" className="w-full min-h-11" aria-invalid={!!errors.environment}>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.environment} />
            </div>
          </FormGrid>
        )}

        {providerCode === "lazada" && (
          <FormGrid>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="region">Region</Label>
              <RegionSelect
                id="region"
                value={credentialValues.region ?? ""}
                onValueChange={handleRegionChange}
                error={errors.region}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appKey">App Key</Label>
              <Input
                id="appKey"
                placeholder="131427"
                className="font-mono"
                value={credentialValues.appKey ?? ""}
                onChange={(e) => updateCredential("appKey", e.target.value)}
                aria-invalid={!!errors.appKey}
              />
              <FieldError message={errors.appKey} />
            </div>
            <div className="space-y-2">
              <SecretInput
                id="appSecret"
                label="Secret Key"
                value={credentialValues.appSecret ?? ""}
                onChange={(v) => updateCredential("appSecret", v)}
                error={errors.appSecret}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCountry">Default country</Label>
              <Input
                id="defaultCountry"
                placeholder="TH"
                maxLength={2}
                className="font-mono uppercase"
                value={credentialValues.defaultCountry ?? ""}
                onChange={(e) => updateCredential("defaultCountry", e.target.value.toUpperCase())}
                aria-invalid={!!errors.defaultCountry}
              />
              <FieldError message={errors.defaultCountry} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default currency</Label>
              <Input
                id="defaultCurrency"
                placeholder="THB"
                maxLength={3}
                className="font-mono uppercase"
                value={credentialValues.defaultCurrency ?? ""}
                onChange={(e) => updateCredential("defaultCurrency", e.target.value.toUpperCase())}
                aria-invalid={!!errors.defaultCurrency}
              />
              <FieldError message={errors.defaultCurrency} />
            </div>
          </FormGrid>
        )}

        {providerCode === "tiktok" && (
          <FormGrid>
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                className="font-mono"
                value={credentialValues.appId ?? ""}
                onChange={(e) => updateCredential("appId", e.target.value)}
                aria-invalid={!!errors.appId}
              />
              <FieldError message={errors.appId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appKey">App Key</Label>
              <Input
                id="appKey"
                className="font-mono"
                value={credentialValues.appKey ?? ""}
                onChange={(e) => updateCredential("appKey", e.target.value)}
                aria-invalid={!!errors.appKey}
              />
              <FieldError message={errors.appKey} />
            </div>
            <div className="sm:col-span-2">
              <SecretInput
                id="appSecret"
                label="App Secret"
                value={credentialValues.appSecret ?? ""}
                onChange={(v) => updateCredential("appSecret", v)}
                error={errors.appSecret}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sellerName">Seller name</Label>
              <Input
                id="sellerName"
                readOnly
                placeholder="Populated after OAuth authorization"
                className="bg-muted/50"
                value={configuration.sellerName ?? ""}
              />
              <p className="text-xs text-muted-foreground">Read-only — filled automatically after connecting</p>
            </div>
          </FormGrid>
        )}
      </SetupSection>

      <OAuthConnectPanel
        providerName={providerName}
        authMethod={authMethod}
        oauthUrl={externalOAuthUrl || undefined}
        useMockOAuth={shouldUseMockMarketplaceOAuth()}
        connected={isOAuthConnected}
        connecting={connecting}
        connectDisabled={!credentialsReady}
        connectDisabledReason={
          !credentialsReady
            ? credentialsDirty
              ? `Complete all ${providerName} app credentials above before re-authorizing`
              : `Complete all ${providerName} app credentials above before authorizing`
            : undefined
        }
        connectLabel={
          credentialsDirty ? `Re-authorize ${providerName}` : `Login to ${providerName}`
        }
        oauthError={oauthError}
        onConnect={() => void handleConnect()}
      />
      <FieldError message={errors.oauth} />

      {isOAuthConnected && (
        <SetupSection title="Authorization result" description="Populated automatically after successful OAuth.">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border border-border/60 bg-muted/30 text-sm">
            {providerCode === "shopee" && (
              <>
                <div><dt className="text-muted-foreground text-xs">Shop Name</dt><dd className="font-medium">{configuration.shopName}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Shop ID</dt><dd className="font-mono">{configuration.shopId}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Seller</dt><dd>{configuration.sellerName}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Currency</dt><dd>{configuration.currency}</dd></div>
              </>
            )}
            {providerCode === "lazada" && (
              <>
                <div><dt className="text-muted-foreground text-xs">Seller ID</dt><dd className="font-mono">{configuration.sellerId}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Seller Name</dt><dd>{configuration.sellerName}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Warehouses</dt><dd>{configuration.warehouseCount}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Currency</dt><dd>{configuration.defaultCurrency ?? configuration.currency}</dd></div>
              </>
            )}
            {providerCode === "tiktok" && (
              <>
                <div><dt className="text-muted-foreground text-xs">Shop ID</dt><dd className="font-mono">{configuration.shopId}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Shop Name</dt><dd>{configuration.shopName}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Seller Name</dt><dd>{configuration.sellerName}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Country</dt><dd>{configuration.country}</dd></div>
                <div><dt className="text-muted-foreground text-xs">Status</dt><dd>{configuration.sellerStatus}</dd></div>
              </>
            )}
            <div><dt className="text-muted-foreground text-xs">Access Token</dt><dd className="font-mono">••••••••••••</dd></div>
            <div><dt className="text-muted-foreground text-xs">Token Expiry</dt><dd>{configuration.tokenExpiry ? new Date(configuration.tokenExpiry).toLocaleString() : "—"}</dd></div>
          </dl>
        </SetupSection>
      )}
    </div>
  );
}

export function ShopeeAuthSetup(props: ProviderAuthSetupProps) {
  return <MarketplaceOAuthSetup {...props} providerCode="shopee" providerName="Shopee" authMethod="Partner OAuth" />;
}

export function LazadaAuthSetup(props: ProviderAuthSetupProps) {
  return <MarketplaceOAuthSetup {...props} providerCode="lazada" providerName="Lazada" authMethod="OAuth 2.0" />;
}

export function TikTokAuthSetup(props: ProviderAuthSetupProps) {
  return <MarketplaceOAuthSetup {...props} providerCode="tiktok" providerName="TikTok Shop" authMethod="TikTok Seller OAuth" />;
}
