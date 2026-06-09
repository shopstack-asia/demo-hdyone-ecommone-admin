/**
 * Marketplace OAuth URL builders matching real provider authorization formats.
 * By default the popup opens the production marketplace authorize URL.
 * Set NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH=true to use the local consent simulator instead.
 */

export type MarketplaceProvider = "shopee" | "lazada" | "tiktok";

export interface MarketplaceOAuthConfig {
  partnerId?: string;
  partnerKey?: string;
  region?: string;
  environment?: string;
  testMode?: string;
  accountType?: string;
  appKey?: string;
  appSecret?: string;
  appId?: string;
  defaultCountry?: string;
  defaultCurrency?: string;
}

export interface BuiltOAuthUrls {
  /** Production marketplace OAuth authorize URL — opened by default */
  authorizeUrl: string;
  /** Local simulated consent page — used when NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH=true */
  mockAuthorizeUrl: string;
  state: string;
  redirectUri: string;
}

export function shouldUseMockMarketplaceOAuth(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH === "true";
}

/** URL opened in the OAuth popup — real marketplace by default */
export function getOAuthPopupUrl(built: BuiltOAuthUrls): string {
  return shouldUseMockMarketplaceOAuth() ? built.mockAuthorizeUrl : built.authorizeUrl;
}

export const MARKETPLACE_OAUTH_META: Record<
  MarketplaceProvider,
  { host: string; path: string; displayName: string }
> = {
  shopee: {
    host: "https://partner.shopee.com",
    path: "/api/v2/shop/auth_partner",
    displayName: "Shopee Partner Center",
  },
  lazada: {
    host: "https://auth.lazada.com",
    path: "/oauth/authorize",
    displayName: "Lazada Open Platform",
  },
  tiktok: {
    host: "https://auth.tiktok-shops.com",
    path: "/oauth/authorize",
    displayName: "TikTok Shop Seller Center",
  },
};

export function generateOAuthState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getOAuthCallbackUri(origin: string, provider: MarketplaceProvider): string {
  return `${origin}/oauth/callback/${provider}`;
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Shopee: sign = HMAC-SHA256(partner_id + path + timestamp, partner_key) */
async function buildShopeeSign(
  partnerId: string,
  partnerKey: string,
  path: string,
  timestamp: number
): Promise<string> {
  const baseString = `${partnerId}${path}${timestamp}`;
  return hmacSha256Hex(partnerKey, baseString);
}

export async function buildMarketplaceAuthorizeUrl(
  provider: MarketplaceProvider,
  config: MarketplaceOAuthConfig,
  origin: string
): Promise<BuiltOAuthUrls> {
  const state = generateOAuthState();
  const redirectUri = getOAuthCallbackUri(origin, provider);
  const meta = MARKETPLACE_OAUTH_META[provider];

  let externalParams: URLSearchParams;
  const mockParams = new URLSearchParams({ state, redirect_uri: redirectUri });

  switch (provider) {
    case "shopee": {
      const partnerId = config.partnerId ?? "";
      const partnerKey = config.partnerKey ?? "";
      const timestamp = Math.floor(Date.now() / 1000);
      const sign = await buildShopeeSign(partnerId, partnerKey, meta.path, timestamp);

      externalParams = new URLSearchParams({
        partner_id: partnerId,
        redirect: redirectUri,
        timestamp: String(timestamp),
        sign,
      });

      mockParams.set("partner_id", partnerId);
      mockParams.set("timestamp", String(timestamp));
      mockParams.set("sign", sign);
      mockParams.set("region", config.region ?? "TH");
      mockParams.set("environment", config.environment ?? "production");
      mockParams.set("test_mode", config.testMode === "true" ? "1" : "0");
      mockParams.set("account_type", config.accountType ?? "erp");
      break;
    }
    case "lazada": {
      const appKey = config.appKey ?? "";
      const country = config.defaultCountry ?? config.region ?? "TH";

      externalParams = new URLSearchParams({
        response_type: "code",
        force_auth: "true",
        redirect_uri: redirectUri,
        client_id: appKey,
        state,
        country,
      });

      mockParams.set("client_id", appKey);
      mockParams.set("country", country);
      mockParams.set("response_type", "code");
      mockParams.set("force_auth", "true");
      mockParams.set("default_currency", config.defaultCurrency ?? "THB");
      break;
    }
    case "tiktok": {
      const appKey = config.appKey ?? "";
      const appId = config.appId ?? "";

      externalParams = new URLSearchParams({
        app_key: appKey,
        app_id: appId,
        state,
        redirect_uri: redirectUri,
        scope: "seller.shop.info,seller.order.info,seller.product.info",
      });

      mockParams.set("app_key", appKey);
      mockParams.set("app_id", appId);
      mockParams.set("scope", "seller.shop.info,seller.order.info,seller.product.info");
      break;
    }
  }

  const authorizeUrl = `${meta.host}${meta.path}?${externalParams.toString()}`;
  mockParams.set("external_url", authorizeUrl);

  return {
    authorizeUrl,
    mockAuthorizeUrl: `${origin}/oauth/authorize/${provider}?${mockParams.toString()}`,
    state,
    redirectUri,
  };
}

export function generateMockAuthCode(provider: MarketplaceProvider): string {
  const prefix = { shopee: "shp_code", lazada: "laz_code", tiktok: "tt_code" }[provider];
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateMockShopId(provider: MarketplaceProvider, region: string): string {
  if (provider === "shopee") return "123456789";
  if (provider === "tiktok") return `TT-${region}-778899001`;
  return `LAZ-${region}-88421`;
}

export const OAUTH_STATE_STORAGE_KEY = "commerceone_oauth_state";

export function storeOAuthState(provider: string, state: string): void {
  localStorage.setItem(`${OAUTH_STATE_STORAGE_KEY}:${provider}`, state);
}

export function verifyOAuthState(provider: string, state: string | null): boolean {
  if (!state) return false;
  const stored = localStorage.getItem(`${OAUTH_STATE_STORAGE_KEY}:${provider}`);
  localStorage.removeItem(`${OAUTH_STATE_STORAGE_KEY}:${provider}`);
  return stored === state;
}

export function storeOAuthPendingConfig(provider: string, config: Record<string, string>): void {
  localStorage.setItem(`${OAUTH_STATE_STORAGE_KEY}:config:${provider}`, JSON.stringify(config));
}

export function consumeOAuthPendingConfig(provider: string): Record<string, string> {
  const key = `${OAUTH_STATE_STORAGE_KEY}:config:${provider}`;
  const raw = localStorage.getItem(key);
  localStorage.removeItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export const OAUTH_MESSAGE_TYPE = "COMMERCEONE_MARKETPLACE_OAUTH";

export interface OAuthCallbackMessage {
  type: typeof OAUTH_MESSAGE_TYPE;
  provider: MarketplaceProvider;
  success: boolean;
  tokens?: Record<string, string>;
  error?: string;
}
