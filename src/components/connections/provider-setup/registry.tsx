"use client";

import type { ComponentType } from "react";
import type { ProviderAuthSetupProps } from "@/lib/provider-connection/types";
import { ShopeeAuthSetup, LazadaAuthSetup, TikTokAuthSetup } from "./marketplace-setup";
import { SapAuthSetup, NetSuiteAuthSetup } from "./erp-setup";
import { SftpAuthSetup, FtpAuthSetup, S3AuthSetup } from "./storage-setup";
import { RestAuthSetup, WebhookAuthSetup } from "./protocol-setup";

const AUTH_SETUP_REGISTRY: Record<string, ComponentType<ProviderAuthSetupProps>> = {
  shopee: ShopeeAuthSetup,
  lazada: LazadaAuthSetup,
  tiktok: TikTokAuthSetup,
  sap: SapAuthSetup,
  netsuite: NetSuiteAuthSetup,
  sftp: SftpAuthSetup,
  ftp: FtpAuthSetup,
  s3: S3AuthSetup,
  rest: RestAuthSetup,
  webhook: WebhookAuthSetup,
  bigquery: RestAuthSetup,
  synapse: RestAuthSetup,
};

export function getProviderAuthSetup(code: string): ComponentType<ProviderAuthSetupProps> | null {
  return AUTH_SETUP_REGISTRY[code.toLowerCase()] ?? null;
}

export function getProviderAuthMethod(code: string): string {
  const methods: Record<string, string> = {
    shopee: "Partner OAuth",
    lazada: "OAuth 2.0",
    tiktok: "TikTok Seller OAuth",
    sap: "Basic Auth / OAuth / Client Credentials",
    netsuite: "Token-Based Authentication (TBA)",
    sftp: "Password / Private Key",
    ftp: "Password",
    s3: "IAM Role / Access Key",
    rest: "None / API Key / Bearer / Basic / OAuth2",
    webhook: "HMAC Signature",
    bigquery: "Google Service Account",
    synapse: "SQL / Service Principal",
  };
  return methods[code.toLowerCase()] ?? "Credentials";
}
