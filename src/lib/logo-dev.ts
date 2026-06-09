/** Provider code → company domain for Logo.dev lookups */
export const PROVIDER_DOMAIN_MAP: Record<string, string> = {
  shopee: "shopee.com",
  lazada: "lazada.com",
  tiktok: "tiktok.com",
  sap: "sap.com",
  netsuite: "netsuite.com",
  s3: "aws.amazon.com",
  bigquery: "cloud.google.com",
  synapse: "microsoft.com",
};

export interface LogoDevOptions {
  size?: number;
  format?: "webp" | "png" | "jpg";
  retina?: boolean;
  fallback?: "monogram" | "404";
  theme?: "auto" | "light" | "dark";
}

/**
 * Build a Logo.dev image URL.
 * @see https://www.logo.dev/docs/logo-images/get
 */
export function getLogoDevUrl(domain: string, options: LogoDevOptions = {}): string | null {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
  if (!token) return null;

  const params = new URLSearchParams({
    token,
    size: String(options.size ?? 128),
    format: options.format ?? "webp",
    fallback: options.fallback ?? "monogram",
    theme: options.theme ?? "auto",
  });

  if (options.retina !== false) {
    params.set("retina", "true");
  }

  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

export function getProviderDomain(code: string): string | undefined {
  return PROVIDER_DOMAIN_MAP[code.toLowerCase()];
}
