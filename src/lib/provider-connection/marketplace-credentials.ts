const MARKETPLACE_CREDENTIAL_KEYS: Record<string, string[]> = {
  shopee: ["partnerId", "partnerKey", "region", "environment", "accountType", "testMode"],
  lazada: ["region", "appKey", "appSecret", "defaultCountry", "defaultCurrency"],
  tiktok: ["appId", "appKey", "appSecret"],
};

export function isMarketplaceProvider(providerCode: string): boolean {
  return providerCode.toLowerCase() in MARKETPLACE_CREDENTIAL_KEYS;
}

export function getMarketplaceCredentialKeys(providerCode: string): string[] {
  return MARKETPLACE_CREDENTIAL_KEYS[providerCode.toLowerCase()] ?? [];
}

export function pickMarketplaceCredentials(
  providerCode: string,
  configuration: Record<string, string>
): Record<string, string> {
  const keys = getMarketplaceCredentialKeys(providerCode);
  return Object.fromEntries(keys.map((key) => [key, configuration[key] ?? ""]));
}

export function mergeMarketplaceCredentials(
  providerCode: string,
  stored: Record<string, string>,
  draft: Record<string, string>
): Record<string, string> {
  const keys = getMarketplaceCredentialKeys(providerCode);
  const merged = { ...stored };
  for (const key of keys) {
    const value = (draft[key] ?? "").trim();
    if (value) merged[key] = value;
  }
  return merged;
}

export function hasMarketplaceCredentialDraft(
  providerCode: string,
  draft: Record<string, string>
): boolean {
  return getMarketplaceCredentialKeys(providerCode).some((key) => (draft[key] ?? "").trim() !== "");
}
