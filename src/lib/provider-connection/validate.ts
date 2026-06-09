const SECRET_KEYS = new Set([
  "password", "partnerKey", "clientSecret", "consumerSecret", "tokenSecret",
  "accessToken", "refreshToken", "secret", "apiKey", "privateKey", "secretAccessKey",
  "appSecret",
]);

export function canStartMarketplaceOAuth(
  providerCode: string,
  config: Record<string, string>
): boolean {
  const code = providerCode.toLowerCase();
  const has = (key: string) => (config[key] ?? "").trim() !== "";

  switch (code) {
    case "shopee":
      return has("partnerId") && has("partnerKey") && has("region") && has("environment");
    case "lazada":
      return has("region") && has("appKey") && has("appSecret") && has("defaultCountry") && has("defaultCurrency");
    case "tiktok":
      return has("appId") && has("appKey") && has("appSecret");
    default:
      return true;
  }
}

export function isSecretKey(key: string): boolean {
  if (SECRET_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  if (lower === "appkey" || lower === "appid" || lower === "partnerid") return false;
  return lower.includes("secret") || lower.includes("password") || lower === "partnerkey";
}

export function validateProviderAuth(
  providerCode: string,
  config: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  const code = providerCode.toLowerCase();
  const req = (key: string, label: string) => {
    if (!(config[key] ?? "").trim()) errors[key] = `${label} is required`;
  };

  switch (code) {
    case "shopee":
      req("partnerId", "Shopee Partner ID");
      req("partnerKey", "Shopee Partner Key");
      req("region", "Near country");
      req("environment", "Environment");
      if (config.oauthConnected !== "true") errors.oauth = "Complete Shopee OAuth authorization (Login to Shopee)";
      break;
    case "lazada":
      req("region", "Region");
      req("appKey", "App Key");
      req("appSecret", "Secret Key");
      req("defaultCountry", "Default country");
      req("defaultCurrency", "Default currency");
      if (config.oauthConnected !== "true") errors.oauth = "Complete Lazada OAuth authorization (Login to Lazada)";
      break;
    case "tiktok":
      req("appId", "App ID");
      req("appKey", "App Key");
      req("appSecret", "App Secret");
      if (config.oauthConnected !== "true") errors.oauth = "Complete TikTok Shop OAuth authorization";
      break;
    case "sap": {
      req("baseUrl", "Base URL");
      req("environment", "Environment");
      const sapAuth = config.authMethod ?? "basic";
      if (sapAuth === "basic") {
        req("username", "Username");
        req("password", "Password");
      } else {
        req("clientId", "Client ID");
        req("clientSecret", "Client Secret");
      }
      break;
    }
    case "netsuite":
      req("accountId", "Account ID");
      req("consumerKey", "Consumer Key");
      req("consumerSecret", "Consumer Secret");
      req("tokenId", "Token ID");
      req("tokenSecret", "Token Secret");
      break;
    case "sftp": {
      req("host", "Host");
      req("port", "Port");
      req("username", "Username");
      req("rootPath", "Root Path");
      const sftpAuth = config.authType ?? "password";
      if (sftpAuth === "password") req("password", "Password");
      else req("privateKeyRef", "Private Key Reference");
      break;
    }
    case "ftp":
      req("host", "Host");
      req("port", "Port");
      req("username", "Username");
      req("password", "Password");
      break;
    case "s3": {
      req("bucket", "Bucket");
      req("region", "Region");
      const s3Auth = config.authMethod ?? "iam_role";
      if (s3Auth === "access_key") {
        req("accessKeyId", "Access Key ID");
        req("secretAccessKey", "Secret Access Key");
      } else {
        req("accessRoleArn", "IAM Role ARN");
      }
      break;
    }
    case "rest": {
      req("baseUrl", "Base URL");
      const restAuth = config.authType ?? "none";
      if (restAuth === "apikey") req("apiKey", "API Key");
      if (restAuth === "bearer") req("bearerToken", "Bearer Token");
      if (restAuth === "basic") { req("username", "Username"); req("password", "Password"); }
      break;
    }
    case "webhook":
      req("targetUrl", "Endpoint URL");
      req("secret", "Signing Secret");
      req("signingAlgorithm", "Signature Algorithm");
      break;
  }
  return errors;
}

export function isReadyForValidation(providerCode: string, config: Record<string, string>): boolean {
  return Object.keys(validateProviderAuth(providerCode, config)).length === 0;
}
