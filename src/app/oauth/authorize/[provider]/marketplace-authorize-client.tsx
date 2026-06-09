"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/providers/provider-logo";
import {
  generateMockAuthCode,
  generateMockShopId,
  getOAuthCallbackUri,
  MARKETPLACE_OAUTH_META,
  type MarketplaceProvider,
} from "@/lib/provider-connection/oauth";
import { ProviderCategory } from "@/types/enums";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

const PROVIDER_NAMES: Record<MarketplaceProvider, string> = {
  shopee: "Shopee",
  lazada: "Lazada",
  tiktok: "TikTok Shop",
};

const BRAND_STYLES: Record<MarketplaceProvider, { header: string; accent: string }> = {
  shopee: { header: "bg-[#EE4D2D]", accent: "text-[#EE4D2D]" },
  lazada: { header: "bg-[#0F146D]", accent: "text-[#0F146D]" },
  tiktok: { header: "bg-black", accent: "text-black" },
};

interface MarketplaceAuthorizeClientProps {
  provider: MarketplaceProvider;
}

export function MarketplaceAuthorizeClient({ provider }: MarketplaceAuthorizeClientProps) {
  const searchParams = useSearchParams();
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = searchParams.get("state") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? getOAuthCallbackUri(window.location.origin, provider);
  const externalUrl = searchParams.get("external_url") ?? "";

  const displayParams = useMemo(() => {
    const entries: { label: string; value: string }[] = [];
    const add = (label: string, key: string) => {
      const v = searchParams.get(key);
      if (v) entries.push({ label, value: v });
    };

    if (provider === "shopee") {
      add("partner_id", "partner_id");
      add("redirect", "redirect_uri");
      add("timestamp", "timestamp");
      add("sign", "sign");
      add("region", "region");
    } else if (provider === "lazada") {
      add("response_type", "response_type");
      add("client_id", "client_id");
      add("redirect_uri", "redirect_uri");
      add("state", "state");
      add("country", "country");
      add("force_auth", "force_auth");
    } else {
      add("app_id", "app_id");
      add("app_key", "app_key");
      add("redirect_uri", "redirect_uri");
      add("state", "state");
      add("scope", "scope");
    }
    return entries;
  }, [provider, searchParams]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));

    const code = generateMockAuthCode(provider);
    const region = searchParams.get("region") ?? searchParams.get("country") ?? "TH";
    const callbackParams = new URLSearchParams({ code, state, region });

    if (provider === "shopee") {
      callbackParams.set("shop_id", generateMockShopId(provider, region));
    }
    if (provider === "lazada") {
      callbackParams.set("country", region);
    }

    window.location.href = `${redirectUri}?${callbackParams.toString()}`;
  };

  const handleDeny = () => {
    const callbackParams = new URLSearchParams({
      error: "access_denied",
      error_description: "User denied authorization",
      state,
    });
    window.location.href = `${redirectUri}?${callbackParams.toString()}`;
  };

  const meta = MARKETPLACE_OAUTH_META[provider];
  const brand = BRAND_STYLES[provider];
  const name = PROVIDER_NAMES[provider];

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <div className={`${brand.header} text-white px-5 py-4 flex items-center gap-3`}>
        <ProviderLogo
          code={provider}
          name={name}
          category={ProviderCategory.MARKETPLACE}
          size={36}
          logoClassName="bg-white/20"
        />
        <div>
          <p className="font-semibold text-sm">{meta.displayName}</p>
          <p className="text-xs text-white/80">Authorization request</p>
        </div>
      </div>

      <div className="flex-1 p-5 max-w-lg mx-auto w-full space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 ${brand.accent}`} />
            <div>
              <p className="font-semibold text-sm">CommerceOne Integration Hub</p>
              <p className="text-sm text-muted-foreground mt-1">
                is requesting access to your {name} seller account.
              </p>
            </div>
          </div>

          <ul className="text-xs text-muted-foreground space-y-1.5 pl-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Read shop / seller information</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Read and manage orders</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Read and update product catalog</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Production authorization URL format
          </p>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[10px] font-mono break-all text-muted-foreground leading-relaxed">
              {externalUrl || `${meta.host}${meta.path}?…`}
            </p>
          </div>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open real {name} endpoint (reference)
          </a>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Request parameters</p>
          <dl className="rounded-lg border divide-y text-xs">
            {displayParams.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[7rem_1fr] gap-2 px-3 py-2">
                <dt className="text-muted-foreground font-mono">{label}</dt>
                <dd className="font-mono break-all">{label === "sign" ? `${value.slice(0, 16)}…` : value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleDeny} disabled={authorizing} className="flex-1 min-h-11">
            Deny
          </Button>
          <Button type="button" onClick={handleAuthorize} disabled={authorizing} className={`flex-1 min-h-11 ${provider === "shopee" ? "bg-[#EE4D2D] hover:bg-[#EE4D2D]/90" : provider === "lazada" ? "bg-[#0F146D] hover:bg-[#0F146D]/90" : ""}`}>
            {authorizing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Authorize
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          Simulated {name} OAuth consent — redirects to CommerceOne callback with authorization code
        </p>
      </div>
    </div>
  );
}
