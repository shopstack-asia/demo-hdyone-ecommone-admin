import type { DiscoveredMetadata, ValidationResult, ConnectionHealthMetrics } from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const OAUTH_URLS: Record<string, string> = {
  shopee: "https://partner.shopee.com/oauth",
  lazada: "https://auth.lazada.com/oauth",
  tiktok: "https://seller.tiktokglobalshop.com/oauth",
};

export function getOAuthUrl(providerCode: string): string | null {
  return OAUTH_URLS[providerCode.toLowerCase()] ?? null;
}

export function simulateOAuthTokens(
  providerCode: string,
  configuration: Record<string, string> = {}
): Record<string, string> {
  const code = providerCode.toLowerCase();
  const expiry = new Date(Date.now() + 3600 * 1000 * 24).toISOString();
  const region = configuration.region ?? configuration.defaultCountry ?? "TH";
  const currency = configuration.defaultCurrency ?? "THB";

  const base = {
    oauthConnected: "true",
    tokenExpiry: expiry,
    region,
    currency,
  };

  if (code === "shopee") {
    return {
      ...base,
      shopId: configuration.shopId ?? "123456789",
      shopName: "Beauty World Thailand",
      sellerName: "Beauty World Co., Ltd.",
      accessToken: "shp_at_mock_" + Math.random().toString(36).slice(2, 14),
      refreshToken: "shp_rt_mock_" + Math.random().toString(36).slice(2, 14),
    };
  }
  if (code === "lazada") {
    return {
      ...base,
      sellerId: "LAZ-" + region + "-88421",
      sellerName: "Fashion Hub Official Store",
      warehouseCount: "3",
      accessToken: "laz_at_mock_" + Math.random().toString(36).slice(2, 14),
      refreshToken: "laz_rt_mock_" + Math.random().toString(36).slice(2, 14),
    };
  }
  if (code === "tiktok") {
    return {
      ...base,
      shopId: configuration.shopId ?? "TT-778899001",
      shopName: "Electronics Plus " + region,
      sellerName: "Electronics Plus Official",
      country: region,
      sellerStatus: "ACTIVE",
      accessToken: "tt_at_mock_" + Math.random().toString(36).slice(2, 14),
      refreshToken: "tt_rt_mock_" + Math.random().toString(36).slice(2, 14),
    };
  }
  return { oauthConnected: "true" };
}

/** Exchange authorization code for tokens (mock token endpoint response). */
export function exchangeOAuthCode(
  providerCode: string,
  authCode: string,
  extras: { shopId?: string; region?: string; config?: Record<string, string> } = {}
): Record<string, string> {
  const mergedConfig: Record<string, string> = {
    ...extras.config,
    ...(extras.shopId ? { shopId: extras.shopId } : {}),
    ...(extras.region ? { region: extras.region, defaultCountry: extras.region } : {}),
  };
  const tokens = simulateOAuthTokens(providerCode, mergedConfig);
  return {
    ...tokens,
    authCode,
    oauthCompletedAt: new Date().toISOString(),
  };
}

export async function simulateValidation(
  providerCode: string,
  configuration: Record<string, string>
): Promise<ValidationResult> {
  await delay(900 + Math.random() * 600);
  const code = providerCode.toLowerCase();

  const base = {
    success: true,
    responseTimeMs: 280 + Math.floor(Math.random() * 220),
    authStatus: "Authenticated",
    providerVersion: "1.0.0",
  };

  switch (code) {
    case "shopee":
      return {
        ...base,
        responseSummary: `Connected to Shopee shop "${configuration.shopName ?? "Shop"}" in ${configuration.region ?? "TH"}. Partner credentials verified.`,
      };
    case "lazada":
      return {
        ...base,
        responseSummary: `Lazada seller "${configuration.sellerName ?? "Seller"}" authenticated. ${configuration.warehouseCount ?? "0"} warehouses accessible.`,
      };
    case "tiktok":
      return {
        ...base,
        responseSummary: `TikTok Shop "${configuration.shopName ?? "Shop"}" connected. Seller status: ${configuration.sellerStatus ?? "ACTIVE"}.`,
      };
    case "sap":
      return {
        ...base,
        providerVersion: "S/4HANA 2023",
        responseSummary: `SAP system reachable at ${configuration.baseUrl}. Client ${configuration.clientId ?? "100"} authenticated.`,
      };
    case "netsuite":
      return {
        ...base,
        providerVersion: "2024.1",
        responseSummary: `NetSuite account ${configuration.accountId} token validated successfully.`,
      };
    case "sftp":
    case "ftp":
      return {
        ...base,
        responseSummary: `Connected to ${configuration.host}:${configuration.port ?? (code === "sftp" ? "22" : "21")}. Authentication successful.`,
      };
    case "s3":
      return {
        ...base,
        responseSummary: `Bucket "${configuration.bucket}" accessible in ${configuration.region}. IAM credentials verified.`,
      };
    case "rest":
      return {
        ...base,
        statusCode: 200,
        sampleResponse: JSON.stringify({ status: "ok", version: "2.1", records: 1247 }, null, 2),
        responseSummary: `GET ${configuration.baseUrl}/health returned 200 OK in ${base.responseTimeMs}ms.`,
      };
    case "webhook":
      return {
        ...base,
        statusCode: 200,
        sampleResponse: JSON.stringify({ received: true, signatureValid: true, timestamp: new Date().toISOString() }, null, 2),
        responseSummary: `Test webhook delivered to ${configuration.targetUrl}. Signature verified.`,
      };
    default:
      return { ...base, responseSummary: "Connection validated successfully." };
  }
}

export async function simulateMetadataDiscovery(
  providerCode: string,
  configuration: Record<string, string>
): Promise<DiscoveredMetadata> {
  await delay(700 + Math.random() * 400);
  const code = providerCode.toLowerCase();

  switch (code) {
    case "shopee":
      return {
        title: "Store Information",
        subtitle: "Discovered from Shopee Partner API",
        sections: [
          { label: "Shop Name", value: configuration.shopName ?? "Beauty World Thailand" },
          { label: "Shop ID", value: configuration.shopId ?? "123456789" },
          { label: "Seller Name", value: configuration.sellerName ?? "Beauty World Co., Ltd." },
          { label: "Country", value: configuration.region ?? "TH" },
          { label: "Currency", value: configuration.currency ?? "THB" },
          { label: "Token Expiry", value: configuration.tokenExpiry ? new Date(configuration.tokenExpiry).toLocaleString() : "—" },
        ],
        raw: { marketplace: "shopee", apiVersion: "v2" },
      };
    case "lazada":
      return {
        title: "Connected Seller Information",
        subtitle: "Discovered from Lazada Open Platform",
        sections: [
          { label: "Seller ID", value: configuration.sellerId ?? "LAZ-TH-88421" },
          { label: "Seller Name", value: configuration.sellerName ?? "Fashion Hub Official Store" },
          { label: "Region", value: configuration.region ?? "TH" },
          { label: "Warehouses", value: configuration.warehouseCount ?? "3" },
          { label: "Currency", value: configuration.currency ?? "THB" },
        ],
      };
    case "tiktok":
      return {
        title: "Connected Shop Summary",
        subtitle: "Discovered from TikTok Shop API",
        sections: [
          { label: "Shop ID", value: configuration.shopId ?? "TT-778899001" },
          { label: "Shop Name", value: configuration.shopName ?? "Electronics Plus TH" },
          { label: "Country", value: configuration.country ?? "TH" },
          { label: "Currency", value: configuration.currency ?? "THB" },
          { label: "Seller Status", value: configuration.sellerStatus ?? "ACTIVE" },
        ],
      };
    case "sap":
      return {
        title: "Connected SAP System",
        subtitle: "Discovered from SAP OData metadata",
        sections: [
          { label: "SAP Version", value: "S/4HANA 2023 FPS02" },
          { label: "Client", value: configuration.clientId ?? "100" },
          { label: "System ID", value: "PRD" },
          { label: "Environment", value: configuration.environment ?? "production" },
          { label: "Base URL", value: configuration.baseUrl ?? "—" },
        ],
      };
    case "netsuite":
      return {
        title: "NetSuite Account",
        subtitle: "Discovered from SuiteTalk REST",
        sections: [
          { label: "Account Name", value: "Retail Corp Production" },
          { label: "Account ID", value: configuration.accountId ?? "—" },
          { label: "Environment", value: "Production" },
          { label: "Version", value: "2024.1" },
        ],
      };
    case "sftp":
    case "ftp":
      return {
        title: "Directory Structure",
        subtitle: `Root: ${configuration.rootPath ?? configuration.remotePath ?? "/"}`,
        sections: [
          { label: "Root Directory", value: configuration.rootPath ?? configuration.remotePath ?? "/data/outbound" },
          { label: "Read Permission", value: "Granted" },
          { label: "Write Permission", value: "Granted" },
          { label: "Available Directories", value: "4" },
        ],
        tree: [
          { name: configuration.rootPath ?? "/data/outbound", type: "folder", children: [
            { name: "orders", type: "folder", children: [
              { name: "pending", type: "folder" },
              { name: "processed", type: "folder" },
            ]},
            { name: "inventory", type: "folder" },
            { name: "archive", type: "folder" },
            { name: "manifest.csv", type: "file" },
          ]},
        ],
      };
    case "s3":
      return {
        title: "Bucket Structure",
        subtitle: `s3://${configuration.bucket}/${configuration.prefix ?? ""}`,
        sections: [
          { label: "Bucket Access", value: "Read / Write" },
          { label: "Region", value: configuration.region ?? "ap-southeast-1" },
          { label: "Prefix", value: configuration.prefix ?? "/" },
        ],
        tree: [
          { name: configuration.bucket ?? "ecomm-data-lake", type: "folder", children: [
            { name: (configuration.prefix ?? "integrations/") + "inbound/", type: "prefix", children: [
              { name: "orders/", type: "folder" },
              { name: "products/", type: "folder" },
            ]},
            { name: (configuration.prefix ?? "integrations/") + "outbound/", type: "prefix" },
            { name: "manifest.json", type: "file" },
          ]},
        ],
      };
    case "rest":
      return {
        title: "Endpoint Metadata",
        subtitle: configuration.baseUrl ?? "",
        sections: [
          { label: "Base URL", value: configuration.baseUrl ?? "—" },
          { label: "Auth Type", value: configuration.authType ?? "none" },
          { label: "API Version", value: "2.1" },
          { label: "Rate Limit", value: "1000 req/min" },
          { label: "Supported Formats", value: "JSON, XML" },
        ],
      };
    case "webhook":
      return {
        title: "Webhook Endpoint",
        subtitle: configuration.targetUrl ?? "",
        sections: [
          { label: "Endpoint URL", value: configuration.targetUrl ?? "—" },
          { label: "Signing Algorithm", value: configuration.signingAlgorithm ?? "hmac-sha256" },
          { label: "Delivery Status", value: "Ready" },
          { label: "Last Test", value: new Date().toLocaleString() },
        ],
      };
    default:
      return { title: "Connection Metadata", sections: [] };
  }
}

export function buildHealthMetrics(validation: ValidationResult): ConnectionHealthMetrics {
  return {
    status: validation.success ? "HEALTHY" : "ERROR",
    responseTimeMs: validation.responseTimeMs,
    successRate: validation.success ? 99.2 + Math.random() * 0.7 : 0,
    lastTested: new Date().toISOString(),
  };
}

export function maskSecret(value: string | undefined): string {
  if (!value) return "—";
  return "••••••••••••";
}
