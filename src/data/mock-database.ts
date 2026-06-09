import {
  AuditAction,
  AuditResult,
  CircuitBreakerState,
  ConnectionStatus,
  ConnectionActivationStatus,
  DlqStatus,
  ExecutionStatus,
  IntegrationStatus,
  ProfileStatus,
  ProviderCapability,
  ProviderCategory,
  RetryStatus,
  RetryStrategy,
  TenantStatus,
  TriggerType,
  NotificationChannel,
  PlatformUserRole,
  PlatformUserStatus,
} from "@/types/enums";
import type {
  AuditLog,
  CircuitBreaker,
  Connection,
  DlqRecord,
  Execution,
  ExecutionErrorRecord,
  PlatformUser,
  ExecutionPolicy,
  ExecutionTimelineEvent,
  Integration,
  MappingProfile,
  PlatformSettings,
  Provider,
  RetentionPolicy,
  RetryPolicy,
  RetryRecord,
  RoutingProfile,
  Tenant,
  TransformationProfile,
  ValidationProfile,
} from "@/types/domain";
import {
  DEFAULT_CIRCUIT_BREAKER,
  DEFAULT_EXECUTION_POLICY,
  DEFAULT_FAILURE_NOTIFICATION,
  DEFAULT_IDEMPOTENCY,
  DEFAULT_RETRY_POLICY,
} from "@/lib/integration-runtime-defaults";
import { getProviderDataFlows } from "./provider-data-flows";

const EXECUTION_STAGES: ExecutionStatus[] = [
  ExecutionStatus.CREATED,
  ExecutionStatus.QUEUED,
  ExecutionStatus.RUNNING,
  ExecutionStatus.VALIDATING,
  ExecutionStatus.MAPPING,
  ExecutionStatus.TRANSFORMING,
  ExecutionStatus.ROUTING,
  ExecutionStatus.DELIVERING,
  ExecutionStatus.COMPLETED,
];

const COUNTRIES = [
  { code: "TH", name: "Thailand", timezone: "Asia/Bangkok" },
  { code: "SG", name: "Singapore", timezone: "Asia/Singapore" },
  { code: "MY", name: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
  { code: "ID", name: "Indonesia", timezone: "Asia/Jakarta" },
  { code: "PH", name: "Philippines", timezone: "Asia/Manila" },
  { code: "VN", name: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
];

function id(prefix: string, num: number): string {
  return `${prefix}-${String(num).padStart(6, "0")}`;
}

function randomDate(daysAgo: number): Date {
  const now = Date.now();
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateConnectionConfiguration(providerCode: string): Record<string, string> {
  switch (providerCode.toLowerCase()) {
    case "shopee":
      return {
        partnerId: "2000001",
        partnerKey: "shpk_mock_partner_key_value",
        shopId: "48291023",
        region: "TH",
        environment: "production",
        oauthConnected: "true",
      };
    case "lazada":
      return {
        region: "TH",
        appKey: "123456",
        appSecret: "lzd_mock_app_secret",
        defaultCountry: "TH",
        defaultCurrency: "THB",
        oauthConnected: "true",
        sellerId: "1000123456",
        sellerName: "Demo Lazada Store",
        warehouseCount: "2",
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    case "tiktok":
      return {
        appId: "7123456789",
        appKey: "tt_mock_app_key",
        appSecret: "tt_mock_app_secret",
        oauthConnected: "true",
      };
    case "sap":
      return {
        baseUrl: "https://sap-uat.company.com:443",
        authMethod: "basic",
        environment: "qa",
        clientId: "100",
        username: "SAP_INTERFACE",
        password: "mock-sap-password",
      };
    case "rest":
      return {
        baseUrl: "https://api.partner.com/v1",
        authType: "bearer",
        bearerToken: "rest_mock_bearer_token",
      };
    case "webhook":
      return {
        targetUrl: "https://hooks.company.com/inbound/orders",
        secret: "webhook_signing_secret",
        signingAlgorithm: "hmac-sha256",
      };
    case "sftp":
      return {
        host: "sftp.partner.com",
        port: "22",
        username: "integration_user",
        authType: "password",
        password: "mock-sftp-password",
        rootPath: "/outbound/orders",
      };
    case "ftp":
      return {
        host: "ftp.partner.com",
        port: "21",
        username: "ftp_user",
        password: "mock-ftp-password",
      };
    case "s3":
      return {
        bucket: "company-integration-data",
        region: "ap-southeast-1",
        prefix: "inbound/",
        accessRoleArn: "arn:aws:iam::123456789012:role/IntegrationRole",
      };
    case "netsuite":
      return {
        accountId: "TSTDRV1234567",
        consumerKey: "mock_consumer_key",
        consumerSecret: "mock_consumer_secret",
        tokenId: "mock_token_id",
        tokenSecret: "mock_token_secret",
      };
    case "bigquery":
      return {
        projectId: "commerce-analytics-prod",
        datasetId: "integration_hub",
        location: "asia-southeast1",
        serviceAccountKey: "mock-service-account-json-ref",
      };
    case "synapse":
      return {
        serverName: "synapse-workspace.sql.azuresynapse.net",
        database: "IntegrationHub",
        authType: "service_principal",
        clientId: "mock-azure-client-id",
        clientSecret: "mock-azure-client-secret",
        tenantId: "mock-azure-tenant-id",
      };
    default:
      return {};
  }
}

function generateProviders(): Provider[] {
  const now = new Date();
  const defs = [
    { code: "shopee", name: "Shopee", category: ProviderCategory.MARKETPLACE, caps: [ProviderCapability.SOURCE] },
    { code: "lazada", name: "Lazada", category: ProviderCategory.MARKETPLACE, caps: [ProviderCapability.SOURCE] },
    { code: "tiktok", name: "TikTok Shop", category: ProviderCategory.MARKETPLACE, caps: [ProviderCapability.SOURCE] },
    { code: "sap", name: "SAP", category: ProviderCategory.ERP, caps: [ProviderCapability.DESTINATION] },
    { code: "rest", name: "REST API", category: ProviderCategory.PROTOCOL, caps: [ProviderCapability.SOURCE, ProviderCapability.DESTINATION] },
    { code: "webhook", name: "Webhook", category: ProviderCategory.PROTOCOL, caps: [ProviderCapability.SOURCE, ProviderCapability.DESTINATION] },
    { code: "sftp", name: "SFTP", category: ProviderCategory.STORAGE, caps: [ProviderCapability.SOURCE, ProviderCapability.DESTINATION] },
    { code: "ftp", name: "FTP", category: ProviderCategory.STORAGE, caps: [ProviderCapability.SOURCE, ProviderCapability.DESTINATION] },
    { code: "s3", name: "Amazon S3", category: ProviderCategory.STORAGE, caps: [ProviderCapability.SOURCE, ProviderCapability.DESTINATION] },
    { code: "netsuite", name: "NetSuite", category: ProviderCategory.ERP, caps: [ProviderCapability.DESTINATION] },
    { code: "bigquery", name: "GCP BigQuery", category: ProviderCategory.CUSTOM, caps: [ProviderCapability.DESTINATION] },
    { code: "synapse", name: "Azure Synapse", category: ProviderCategory.CUSTOM, caps: [ProviderCapability.DESTINATION] },
  ];

  return defs.map((d, i) => ({
    id: id("PRV", i + 1),
    code: d.code,
    name: d.name,
    category: d.category,
    version: "1.0.0",
    capabilities: d.caps,
    configurationSchema: getProviderSchema(d.code),
    supportedTriggers: [TriggerType.SCHEDULE, TriggerType.WEBHOOK, TriggerType.API],
    dataFlows: getProviderDataFlows(d.code),
    description: `${d.name} integration provider`,
    icon: `/providers/${d.code}.svg`,
    createdAt: now,
    updatedAt: now,
  }));
}

import type { ConfigSchemaField } from "@/types/domain";

function getProviderSchema(code: string): ConfigSchemaField[] {
  const schemas: Record<string, ConfigSchemaField[]> = {
    shopee: [
      { key: "partnerId", label: "Shopee Partner ID", type: "text" as const, required: true },
      { key: "partnerKey", label: "Shopee Partner Key", type: "password" as const, required: true },
      { key: "region", label: "Near Country", type: "select" as const, required: true, options: [
        { label: "Thailand", value: "TH" },
        { label: "Singapore", value: "SG" },
        { label: "Malaysia", value: "MY" },
      ]},
      { key: "environment", label: "Environment", type: "select" as const, required: true, options: [
        { label: "Production", value: "production" },
        { label: "Sandbox", value: "sandbox" },
      ]},
    ],
    lazada: [
      { key: "region", label: "Region", type: "select" as const, required: true, options: [
        { label: "Thailand", value: "TH" },
        { label: "Singapore", value: "SG" },
      ]},
      { key: "appKey", label: "App Key", type: "text" as const, required: true },
      { key: "appSecret", label: "Secret Key", type: "password" as const, required: true },
      { key: "defaultCountry", label: "Default Country", type: "text" as const, required: true },
      { key: "defaultCurrency", label: "Default Currency", type: "text" as const, required: true },
    ],
    tiktok: [
      { key: "appId", label: "App ID", type: "text" as const, required: true },
      { key: "appKey", label: "App Key", type: "text" as const, required: true },
      { key: "appSecret", label: "App Secret", type: "password" as const, required: true },
    ],
    sap: [
      { key: "baseUrl", label: "Base URL", type: "url" as const, required: true },
      { key: "clientId", label: "Client ID", type: "text" as const, required: true },
      { key: "username", label: "Username", type: "text" as const, required: true },
      { key: "password", label: "Password", type: "password" as const, required: true },
      { key: "environment", label: "Environment", type: "select" as const, required: true, options: [
        { label: "Production", value: "production" },
        { label: "QA", value: "qa" },
      ]},
    ],
    rest: [
      { key: "baseUrl", label: "Base URL", type: "url" as const, required: true },
      { key: "authType", label: "Auth Type", type: "select" as const, required: true, options: [
        { label: "None", value: "none" },
        { label: "Basic", value: "basic" },
        { label: "Bearer Token", value: "bearer" },
        { label: "API Key", value: "apikey" },
      ]},
      { key: "apiKey", label: "API Key", type: "password" as const, required: false },
    ],
    webhook: [
      { key: "targetUrl", label: "Target URL", type: "url" as const, required: true },
      { key: "secret", label: "Secret", type: "password" as const, required: true },
      { key: "signingAlgorithm", label: "Signing Algorithm", type: "select" as const, required: true, options: [
        { label: "HMAC SHA256", value: "hmac-sha256" },
        { label: "HMAC SHA1", value: "hmac-sha1" },
      ]},
    ],
    sftp: [
      { key: "host", label: "Host", type: "text" as const, required: true },
      { key: "port", label: "Port", type: "number" as const, required: true, placeholder: "22" },
      { key: "username", label: "Username", type: "text" as const, required: true },
      { key: "authType", label: "Auth Type", type: "select" as const, required: true, options: [
        { label: "Password", value: "password" },
        { label: "Private Key", value: "private_key" },
      ]},
      { key: "password", label: "Password / Private Key Reference", type: "password" as const, required: false },
      { key: "rootPath", label: "Root Path", type: "text" as const, required: true },
    ],
    ftp: [
      { key: "host", label: "Host", type: "text" as const, required: true },
      { key: "port", label: "Port", type: "number" as const, required: true, placeholder: "21" },
      { key: "username", label: "Username", type: "text" as const, required: true },
      { key: "password", label: "Password", type: "password" as const, required: true },
    ],
    s3: [
      { key: "bucket", label: "Bucket Name", type: "text" as const, required: true },
      { key: "region", label: "Region", type: "text" as const, required: true },
      { key: "prefix", label: "Prefix", type: "text" as const, required: false },
      { key: "accessRoleArn", label: "Access Role ARN / Secret Reference", type: "text" as const, required: true },
    ],
    netsuite: [
      { key: "accountId", label: "Account ID", type: "text" as const, required: true },
      { key: "consumerKey", label: "Consumer Key", type: "text" as const, required: true },
      { key: "consumerSecret", label: "Consumer Secret", type: "password" as const, required: true },
      { key: "tokenId", label: "Token ID", type: "text" as const, required: true },
      { key: "tokenSecret", label: "Token Secret", type: "password" as const, required: true },
    ],
    bigquery: [
      { key: "projectId", label: "GCP Project ID", type: "text" as const, required: true },
      { key: "datasetId", label: "Dataset ID", type: "text" as const, required: true },
      { key: "location", label: "Location", type: "text" as const, required: false, placeholder: "asia-southeast1" },
      { key: "serviceAccountKey", label: "Service Account Key (JSON)", type: "password" as const, required: true },
    ],
    synapse: [
      { key: "serverName", label: "Server / Workspace SQL Endpoint", type: "text" as const, required: true },
      { key: "database", label: "Database", type: "text" as const, required: true },
      { key: "authType", label: "Auth Type", type: "select" as const, required: true, options: [
        { label: "SQL Authentication", value: "sql" },
        { label: "Service Principal", value: "service_principal" },
      ]},
      { key: "username", label: "Username / Client ID", type: "text" as const, required: true },
      { key: "password", label: "Password / Client Secret", type: "password" as const, required: true },
      { key: "tenantId", label: "Azure Tenant ID", type: "text" as const, required: false },
    ],
  };
  return schemas[code] ?? [];
}

function generateTenants(): Tenant[] {
  const names = [
    "Brand Alpha", "Brand Beta", "Brand Gamma", "Retail Corp", "Fashion Hub",
    "Electronics Plus", "Home & Living", "Beauty World", "Sports Direct", "Food Market",
    "Luxury Brands", "Kids Store", "Pet Paradise", "Auto Parts Co", "Garden Center",
    "Tech Gadgets", "Wellness Co", "Travel Gear", "Office Supply", "Art Gallery",
  ];
  const statuses = [TenantStatus.ACTIVE, TenantStatus.ACTIVE, TenantStatus.ACTIVE, TenantStatus.SUSPENDED, TenantStatus.PENDING];

  return names.map((name, i) => {
    const country = COUNTRIES[i % COUNTRIES.length];
    const createdAt = randomDate(365);
    return {
      id: id("TNT", i + 1),
      code: `BR${String(i + 1).padStart(3, "0")}`,
      name,
      country: country.name,
      timezone: country.timezone,
      status: statuses[i % statuses.length],
      description: `${name} integration tenant`,
      createdAt,
      updatedAt: randomDate(30),
    };
  });
}

function isMarketplaceProvider(provider: Provider): boolean {
  return provider.category === ProviderCategory.MARKETPLACE;
}

function isDestinationProvider(provider: Provider): boolean {
  return (
    provider.category === ProviderCategory.ERP ||
    provider.category === ProviderCategory.STORAGE ||
    provider.category === ProviderCategory.PROTOCOL ||
    provider.category === ProviderCategory.CRM ||
    provider.category === ProviderCategory.WMS ||
    provider.category === ProviderCategory.CUSTOM
  );
}

function generateConnections(tenants: Tenant[], providers: Provider[]): Connection[] {
  const connections: Connection[] = [];
  let counter = 1;
  const healthStatuses = [ConnectionStatus.HEALTHY, ConnectionStatus.HEALTHY, ConnectionStatus.WARNING, ConnectionStatus.ERROR];
  const activeStatuses = [ConnectionActivationStatus.ACTIVE, ConnectionActivationStatus.ACTIVE, ConnectionActivationStatus.INACTIVE];
  const marketplaceProviders = providers.filter(isMarketplaceProvider);
  const destinationProviders = providers.filter(isDestinationProvider);

  for (const tenant of tenants) {
    const sourceCount = 2 + Math.floor(Math.random() * 2);
    const destCount = 2 + Math.floor(Math.random() * 2);

    for (let j = 0; j < sourceCount; j++) {
      const provider = marketplaceProviders[j % marketplaceProviders.length];
      const createdAt = randomDate(180);
      connections.push({
        id: id("CON", counter++),
        tenantId: tenant.id,
        providerId: provider.id,
        name: `${provider.name} ${pick(["Main", "Production", "UAT", "Backup", "Secondary"])}`,
        status: healthStatuses[j % healthStatuses.length],
        activeStatus: activeStatuses[j % activeStatuses.length],
        configuration: generateConnectionConfiguration(provider.code),
        lastTestedAt: randomDate(7),
        lastUsedAt: randomDate(1),
        createdAt,
        updatedAt: randomDate(7),
      });
    }

    for (let j = 0; j < destCount; j++) {
      const provider = destinationProviders[j % destinationProviders.length];
      const createdAt = randomDate(180);
      connections.push({
        id: id("CON", counter++),
        tenantId: tenant.id,
        providerId: provider.id,
        name: `${provider.name} ${pick(["Main", "Production", "UAT", "Backup", "Secondary"])}`,
        status: healthStatuses[(j + 1) % healthStatuses.length],
        activeStatus: activeStatuses[(j + 1) % activeStatuses.length],
        configuration: generateConnectionConfiguration(provider.code),
        lastTestedAt: randomDate(7),
        lastUsedAt: randomDate(1),
        createdAt,
        updatedAt: randomDate(7),
      });
    }
  }
  return connections.slice(0, 100);
}

function generateProfiles() {
  const now = new Date();
  const namedValidationCodes = [
    "COMMERCE_ORDER_DEFAULT", "COMMERCE_PRODUCT_DEFAULT", "COMMERCE_INVENTORY_DEFAULT",
    "COMMERCE_PRICE_DEFAULT", "FILE_PRODUCT_DEFAULT", "ERP_ORDER_DEFAULT", "API_GENERIC_DEFAULT",
    "WEBHOOK_GENERIC_DEFAULT", "GENERIC_VALIDATION",
  ];
  const namedMappingCodes = [
    "SHOPEE_ORDER_TO_ERP_ORDER", "LAZADA_ORDER_TO_ERP_ORDER", "FILE_PRODUCT_TO_ERP_PRODUCT",
    "SAP_SALES_ORDER_TO_TARGET_ORDER", "REST_ORDER_TO_ERP_ORDER", "GENERIC_MAPPING",
  ];

  const validationProfiles: ValidationProfile[] = [
    ...namedValidationCodes.map((code, i) => ({
      id: id("VAL", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Validation rules for ${code}`,
      rules: { requiredFields: ["orderId", "sku", "quantity"], maxRecords: 10000 },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 11 }, (_, i) => ({
      id: id("VAL", namedValidationCodes.length + i + 1),
      code: `VAL-${String(i + 1).padStart(3, "0")}`,
      name: `Validation Profile ${i + 1}`,
      description: `Standard validation rules set ${i + 1}`,
      rules: { requiredFields: ["orderId", "sku", "quantity"], maxRecords: 10000 },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const mappingProfiles: MappingProfile[] = [
    ...namedMappingCodes.map((code, i) => ({
      id: id("MAP", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Mapping template ${code}`,
      mappings: {
        "source.order_id": "destination.orderNumber",
        "source.items": "destination.lineItems",
        "source.total": "destination.grandTotal",
      },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 14 }, (_, i) => ({
      id: id("MAP", namedMappingCodes.length + i + 1),
      code: `MAP-${String(i + 1).padStart(3, "0")}`,
      name: `Mapping Profile ${i + 1}`,
      description: `Field mapping configuration ${i + 1}`,
      mappings: {
        "source.order_id": "destination.orderNumber",
        "source.items": "destination.lineItems",
        "source.total": "destination.grandTotal",
      },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const namedTransformCodes = ["ORDER_DEFAULT_TRANSFORM", "PRODUCT_DEFAULT_TRANSFORM", "GENERIC_TRANSFORM"];
  const transformationProfiles: TransformationProfile[] = [
    ...namedTransformCodes.map((code, i) => ({
      id: id("TRF", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Transformation rules for ${code}`,
      rules: { currency: "THB", dateFormat: "ISO8601", encoding: "UTF-8" },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 17 }, (_, i) => ({
      id: id("TRF", namedTransformCodes.length + i + 1),
      code: `TRF-${String(i + 1).padStart(3, "0")}`,
      name: `Transformation Profile ${i + 1}`,
      description: `Data transformation rules ${i + 1}`,
      rules: { currency: "THB", dateFormat: "ISO8601", encoding: "UTF-8" },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const namedRoutingCodes = ["STANDARD_ROUTE"];
  const routingProfiles: RoutingProfile[] = [
    ...namedRoutingCodes.map((code, i) => ({
      id: id("RTG", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Routing configuration ${code}`,
      rules: { strategy: "round-robin", fallback: "dlq" },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 19 }, (_, i) => ({
      id: id("RTG", namedRoutingCodes.length + i + 1),
      code: `RTG-${String(i + 1).padStart(3, "0")}`,
      name: `Routing Profile ${i + 1}`,
      description: `Routing configuration ${i + 1}`,
      rules: { strategy: "round-robin", fallback: "dlq" },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const namedExecutionCodes = [
    "STANDARD_ORDER_SYNC", "STANDARD_CATALOG_SYNC", "STANDARD_FILE_IMPORT",
    "STANDARD_ERP_SYNC", "STANDARD_EXECUTION",
  ];
  const executionPolicies: ExecutionPolicy[] = [
    ...namedExecutionCodes.map((code, i) => ({
      id: id("EXP", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Execution policy ${code}`,
      config: { maxConcurrency: 5, timeoutMs: 300000, batchSize: 100 },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: id("EXP", namedExecutionCodes.length + i + 1),
      code: `EXP-${String(i + 1).padStart(3, "0")}`,
      name: `Execution Policy ${i + 1}`,
      description: `Execution policy configuration ${i + 1}`,
      config: { maxConcurrency: 5, timeoutMs: 300000, batchSize: 100 },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const namedRetryCodes = ["STANDARD_RETRY"];
  const retryPolicies: RetryPolicy[] = [
    ...namedRetryCodes.map((code, i) => ({
      id: id("RTP", i + 1),
      code,
      name: code.replace(/_/g, " "),
      description: `Retry policy ${code}`,
      strategy: RetryStrategy.EXPONENTIAL,
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      config: { jitter: true },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      id: id("RTP", namedRetryCodes.length + i + 1),
      code: `RTP-${String(i + 1).padStart(3, "0")}`,
      name: `Retry Policy ${i + 1}`,
      description: `Retry policy configuration ${i + 1}`,
      strategy: pick([RetryStrategy.FIXED, RetryStrategy.EXPONENTIAL, RetryStrategy.LINEAR]),
      maxAttempts: 3 + (i % 5),
      initialDelayMs: 1000 * (i + 1),
      maxDelayMs: 60000,
      config: { jitter: true },
      status: ProfileStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const retentionPolicies: RetentionPolicy[] = Array.from({ length: 5 }, (_, i) => ({
    id: id("RET", i + 1),
    code: `RET-${String(i + 1).padStart(3, "0")}`,
    name: `Retention Policy ${i + 1}`,
    description: `Data retention configuration ${i + 1}`,
    executionRetentionDays: 30 + i * 15,
    dlqRetentionDays: 90 + i * 30,
    auditRetentionDays: 365,
    status: ProfileStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  }));

  return { validationProfiles, mappingProfiles, transformationProfiles, routingProfiles, executionPolicies, retryPolicies, retentionPolicies };
}

function buildMockTriggerConfig(
  tenantId: string,
  code: string,
  triggerType: TriggerType,
  index: number
) {
  if (triggerType === TriggerType.WEBHOOK) {
    return {
      webhookUrl: `https://hooks.commerceone.io/${tenantId}/${code.toLowerCase()}`,
      signingSecret: `whsec_${String(index).padStart(8, "0")}`,
      signatureVerificationEnabled: true,
      allowedIps: index % 2 === 0 ? ["203.0.113.0/24"] : [],
    };
  }
  if (triggerType === TriggerType.API) {
    return {
      apiEndpoint: `https://api.commerceone.io/v1/integrations/${code.toLowerCase()}/run`,
      apiKeyRequired: true,
      allowedMethods: ["POST"],
      manualRunEnabled: index % 3 !== 0,
    };
  }
  return {
    cronExpression: index % 2 === 0 ? "0 */15 * * * *" : "0 0 * * * *",
    timezone: "Asia/Bangkok",
    enabled: index % 5 !== 0,
    pollingMode: index % 4 === 0,
    sourcePath: "/inbound/orders",
    filePattern: "*.csv",
    processedPath: "/processed/orders",
    errorPath: "/error/orders",
  };
}

function buildMockRuntimeConfig(index: number) {
  return {
    executionPolicy: {
      ...DEFAULT_EXECUTION_POLICY,
      batchSize: 500 + (index % 5) * 100,
      requestsPerSecond: index % 3 === 0 ? null : 20,
      unlimitedRequestRate: index % 3 === 0,
    },
    retryPolicy: {
      ...DEFAULT_RETRY_POLICY,
      strategy:
        index % 3 === 0
          ? RetryStrategy.FIXED
          : index % 3 === 1
            ? RetryStrategy.EXPONENTIAL
            : RetryStrategy.DECORRELATED_JITTER,
      unlimitedRetryWindow: index % 7 === 0,
      maxRetryDays: index % 7 === 0 ? null : 7,
    },
    failureNotification: {
      ...DEFAULT_FAILURE_NOTIFICATION,
      notifyOnFailure: index % 4 !== 0,
      channels:
        index % 2 === 0
          ? [NotificationChannel.EMAIL, NotificationChannel.SLACK]
          : [NotificationChannel.EMAIL],
      emails: ["ops@example.com", "integration-team@example.com"],
    },
    circuitBreaker: {
      ...DEFAULT_CIRCUIT_BREAKER,
      enabled: index % 6 !== 0,
    },
    idempotency: DEFAULT_IDEMPOTENCY,
  };
}

function generateIntegrations(
  tenants: Tenant[],
  connections: Connection[],
  providers: Provider[],
  profiles: ReturnType<typeof generateProfiles>
): Integration[] {
  const integrations: Integration[] = [];
  let counter = 1;
  const triggers = [TriggerType.SCHEDULE, TriggerType.WEBHOOK, TriggerType.API];
  const statuses = [IntegrationStatus.ACTIVE, IntegrationStatus.ACTIVE, IntegrationStatus.INACTIVE, IntegrationStatus.DRAFT];
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  for (const tenant of tenants) {
    const tenantConnections = connections.filter((c) => c.tenantId === tenant.id);
    const sourceConnections = tenantConnections.filter((c) => {
      const provider = providerMap.get(c.providerId);
      return provider && isMarketplaceProvider(provider);
    });
    const destinationConnections = tenantConnections.filter((c) => {
      const provider = providerMap.get(c.providerId);
      return provider && isDestinationProvider(provider);
    });
    if (sourceConnections.length === 0 || destinationConnections.length === 0) continue;

    const count = 8 + Math.floor(Math.random() * 4);
    for (let j = 0; j < count && counter <= 200; j++) {
      const sourceConn = sourceConnections[j % sourceConnections.length];
      const destConn = destinationConnections[j % destinationConnections.length];
      const sourceProvider = providerMap.get(sourceConn.providerId)!;
      const destProvider = providerMap.get(destConn.providerId)!;
      const dataFlow = sourceProvider.dataFlows[j % Math.max(sourceProvider.dataFlows.length, 1)];
      const createdAt = randomDate(120);
      const integrationKey = `INT-${String(counter).padStart(4, "0")}`;
      integrations.push({
        id: integrationKey,
        tenantId: tenant.id,
        code: integrationKey,
        name: `${sourceProvider.name} → ${destProvider.name}`,
        description: `Sync data from ${sourceProvider.name} to ${destProvider.name}`,
        tags: ["production", "automated"],
        owner: "Integration Team",
        sourceConnectionId: sourceConn.id,
        destinationConnectionId: destConn.id,
        sourceProviderId: sourceProvider.id,
        destinationProviderId: destProvider.id,
        dataFlowId: dataFlow?.id ?? "generic-flow",
        triggerType: triggers[j % triggers.length],
        validationProfileId: profiles.validationProfiles[j % profiles.validationProfiles.length].id,
        mappingProfileId: profiles.mappingProfiles[j % profiles.mappingProfiles.length].id,
        transformationProfileId: profiles.transformationProfiles[j % profiles.transformationProfiles.length].id,
        routingProfileId: profiles.routingProfiles[j % profiles.routingProfiles.length].id,
        executionPolicyId: profiles.executionPolicies[j % profiles.executionPolicies.length].id,
        retryPolicyId: profiles.retryPolicies[j % profiles.retryPolicies.length].id,
        status: statuses[j % statuses.length],
        lastRunAt: randomDate(3),
        successRate: 85 + Math.random() * 14,
        triggerConfig: buildMockTriggerConfig(
          tenant.id,
          `INT-${String(counter).padStart(4, "0")}`,
          triggers[j % triggers.length],
          counter
        ),
        ...buildMockRuntimeConfig(counter),
        createdAt,
        updatedAt: randomDate(7),
      });
      counter++;
    }
  }
  return integrations.slice(0, 200);
}

function applyIntegrationCircuitBreakerStatus(
  integrations: Integration[],
  circuitBreakers: CircuitBreaker[]
): void {
  const openConnectionIds = new Set(
    circuitBreakers
      .filter((cb) => cb.state === CircuitBreakerState.OPEN)
      .map((cb) => cb.connectionId)
  );

  for (const integration of integrations) {
    if (
      integration.circuitBreaker?.enabled &&
      integration.status === IntegrationStatus.ACTIVE &&
      (openConnectionIds.has(integration.sourceConnectionId) ||
        openConnectionIds.has(integration.destinationConnectionId))
    ) {
      integration.status = IntegrationStatus.BREAK;
    }
  }
}

const TIMELINE_MESSAGES: Partial<Record<ExecutionStatus, string>> = {
  [ExecutionStatus.CREATED]: "Execution started",
  [ExecutionStatus.QUEUED]: "Execution queued",
  [ExecutionStatus.RUNNING]: "Source data loaded",
  [ExecutionStatus.VALIDATING]: "Validation completed",
  [ExecutionStatus.MAPPING]: "Mapping completed",
  [ExecutionStatus.TRANSFORMING]: "Transformation completed",
  [ExecutionStatus.ROUTING]: "Routing completed",
  [ExecutionStatus.DELIVERING]: "Delivery started",
  [ExecutionStatus.COMPLETED]: "Execution completed",
  [ExecutionStatus.FAILED]: "Execution failed",
};

const ERROR_CODES = ["SAP_TIMEOUT", "INVALID_SKU", "DUPLICATE_ORDER", "MAP_001", "AUTH_EXPIRED"];
const SOURCE_ERROR_CODES = ["INVALID_FILE_FORMAT", "SOURCE_API_ERROR", "SOURCE_FETCH_FAILED"];
const SOURCE_ERROR_MESSAGES = [
  "Source file format is invalid or unsupported.",
  "Source API returned an error while fetching data.",
  "Unable to read records from source connection.",
];
const ENVIRONMENTS = ["Production", "UAT", "Staging"];

function buildTimeline(
  startedAt: Date,
  finalStatus: ExecutionStatus,
  sourceFailure = false
): ExecutionTimelineEvent[] {
  const timeline: ExecutionTimelineEvent[] = [];
  let current = startedAt.getTime();
  const isFailure = finalStatus === ExecutionStatus.FAILED;
  const stages = sourceFailure
    ? EXECUTION_STAGES.slice(0, 3)
    : isFailure
      ? EXECUTION_STAGES.slice(0, 5 + Math.floor(Math.random() * 3))
      : EXECUTION_STAGES;

  for (const stage of stages) {
    const duration = 100 + Math.floor(Math.random() * 2000);
    timeline.push({
      stage,
      timestamp: new Date(current),
      durationMs: duration,
      message: TIMELINE_MESSAGES[stage],
    });
    current += duration;
  }

  if (isFailure) {
    timeline.push({
      stage: ExecutionStatus.FAILED,
      timestamp: new Date(current),
      message: TIMELINE_MESSAGES[ExecutionStatus.FAILED],
    });
  }

  return timeline;
}

function buildExecutionStages(
  totalMs: number,
  recordsProcessed: number,
  recordsFailed: number,
  failed: boolean,
  isRunning: boolean,
  errorCode?: string,
  errorMessage?: string,
  failureStageId: "SOURCE" | "VALIDATION" | "MAPPING" | "TRANSFORMATION" | "DELIVERY" = "DELIVERY"
) {
  const weights = [0.08, 0.12, 0.08, 0.14, 0.58];
  const stageDefs = [
    { stageId: "SOURCE" as const, label: "Source" },
    { stageId: "VALIDATION" as const, label: "Validation" },
    { stageId: "MAPPING" as const, label: "Mapping" },
    { stageId: "TRANSFORMATION" as const, label: "Transformation" },
    { stageId: "DELIVERY" as const, label: "Delivery" },
  ];

  const failedStageIndex = stageDefs.findIndex((stage) => stage.stageId === failureStageId);

  if (failed && failureStageId === "SOURCE") {
    return stageDefs.map((def, index) => ({
      stageId: def.stageId,
      label: def.label,
      status: def.stageId === "SOURCE" ? ("FAILED" as const) : ("SKIPPED" as const),
      durationMs: def.stageId === "SOURCE" ? totalMs : 0,
      recordsProcessed: 0,
      recordsFailed: 0,
      percentageOfTotalTime: def.stageId === "SOURCE" ? 100 : 0,
      errorCode: def.stageId === "SOURCE" ? errorCode : undefined,
      errorMessage: def.stageId === "SOURCE" ? errorMessage : undefined,
    }));
  }

  const durations = weights.map((w) => Math.round(totalMs * w));
  const durationSum = durations.reduce((a, b) => a + b, 0);
  if (durationSum !== totalMs && durations.length > 0) {
    durations[durations.length - 1] += totalMs - durationSum;
  }

  const successRecords = recordsProcessed - recordsFailed;
  const recordsPerStage = Math.max(1, Math.floor(successRecords / stageDefs.length));
  const runningStageIndex = isRunning ? 3 + Math.floor(Math.random() * 2) : -1;

  return stageDefs.map((def, index) => {
    const durationMs = durations[index];
    const percentageOfTotalTime =
      totalMs > 0 ? Math.round((durationMs / totalMs) * 1000) / 10 : 0;
    const isFailedStage = failed && def.stageId === failureStageId;
    const isSkipped = failed && index > failedStageIndex;
    const isRunningStage = isRunning && index === runningStageIndex;
    const isPending = isRunning && index > runningStageIndex;

    let status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED" = "SUCCESS";
    if (isFailedStage) status = "FAILED";
    else if (isSkipped) status = "SKIPPED";
    else if (isRunningStage) status = "RUNNING";
    else if (isPending) status = "PENDING";
    else if (isRunning && index < runningStageIndex) status = "SUCCESS";

    return {
      stageId: def.stageId,
      label: def.label,
      status,
      durationMs,
      recordsProcessed: isFailedStage ? recordsProcessed : recordsPerStage,
      recordsFailed: isFailedStage ? recordsFailed : 0,
      percentageOfTotalTime,
      errorCode: isFailedStage ? errorCode : undefined,
      errorMessage: isFailedStage ? errorMessage : undefined,
    };
  });
}

function buildOperationalInsight(
  status: ExecutionStatus,
  params: {
    stages: ReturnType<typeof buildExecutionStages>;
    recordsProcessed: number;
    recordsFailed: number;
    chunksFailed: number;
    chunkCount: number;
    chunksCompleted: number;
    apiCalls: number;
    averageResponseTimeMs: number;
    recordsPerSecond: number;
    durationMs: number;
    startedAt: Date;
    finishedAt?: Date;
    errorCode?: string;
    errorMessage?: string;
    retryCount: number;
    nextRetryAt?: Date;
  }
) {
  const {
    stages,
    recordsProcessed,
    recordsFailed,
    chunksFailed,
    chunkCount,
    chunksCompleted,
    apiCalls,
    averageResponseTimeMs,
    recordsPerSecond,
    durationMs,
    startedAt,
    finishedAt,
    errorCode,
    errorMessage,
    retryCount,
    nextRetryAt,
  } = params;

  const isFailed =
    status === ExecutionStatus.FAILED ||
    (status === ExecutionStatus.COMPLETED && recordsFailed > 0);

  if (status === ExecutionStatus.FAILED && retryCount > 0 && nextRetryAt) {
    return {
      retrySummary: {
        strategy: "EXPONENTIAL",
        currentAttempt: retryCount,
        maxAttempts: 5,
        nextRetryAt,
        lastErrorCode: errorCode ?? "UNKNOWN",
        retryScope: "Failed Records Only",
      },
    };
  }

  if (isFailed) {
    const failedStage = stages.find((s) => s.status === "FAILED") ?? stages[stages.length - 1];
    return {
      failureAnalysis: {
        failureStageId: failedStage.stageId,
        errorCode: errorCode ?? failedStage.errorCode ?? "UNKNOWN",
        errorMessage:
          errorMessage ??
          failedStage.errorMessage ??
          "Execution failed during pipeline processing.",
        failedRecords: recordsFailed,
        affectedChunks: chunksFailed,
        affectedBatch: "Batch #1",
        firstFailureAt: finishedAt ?? startedAt,
        recommendedAction:
          failedStage.stageId === "SOURCE"
            ? "Fix source file format or source API connection, then rerun the execution."
            : failedStage.stageId === "DELIVERY"
              ? "Reconnect destination connection and retry failed records."
              : "Review error details and retry failed records.",
      },
    };
  }

  const isRunning =
    status === ExecutionStatus.RUNNING ||
    status === ExecutionStatus.QUEUED ||
    status === ExecutionStatus.VALIDATING ||
    status === ExecutionStatus.MAPPING ||
    status === ExecutionStatus.TRANSFORMING ||
    status === ExecutionStatus.ROUTING ||
    status === ExecutionStatus.DELIVERING;

  if (isRunning) {
    const currentStage = stages.find((s) => s.status === "RUNNING") ?? stages[0];
    const processedSoFar = Math.floor(recordsProcessed * (chunksCompleted / Math.max(chunkCount, 1)));
    return {
      liveStatus: {
        currentStageId: currentStage.stageId,
        recordsProcessed: processedSoFar,
        totalRecords: recordsProcessed,
        currentChunk: chunksCompleted,
        totalChunks: chunkCount,
        runningDurationMs: durationMs,
        estimatedRemainingMs: Math.round(durationMs * 0.4),
        workerId: `worker-${String(1 + Math.floor(Math.random() * 8)).padStart(2, "0")}`,
      },
    };
  }

  if (status === ExecutionStatus.COMPLETED && recordsFailed === 0) {
    const slowest = stages.reduce((max, stage) =>
      stage.durationMs > max.durationMs ? stage : max
    );
    return {
      performanceAnalysis: {
        slowestStageId: slowest.stageId,
        slowestStageLabel: slowest.label,
        slowestStageDurationMs: slowest.durationMs,
        slowestStageShare: slowest.percentageOfTotalTime,
        averageResponseTimeMs,
        recordsPerSecond,
        apiCalls,
        bottleneckAssessment:
          slowest.stageId === "DELIVERY"
            ? "Destination system response time dominated execution duration."
            : `${slowest.label} stage consumed the largest share of execution time.`,
      },
    };
  }

  return {};
}

function buildErrorSummary(
  recordsFailed: number,
  topError: string,
  failureStageId: "SOURCE" | "VALIDATION" | "MAPPING" | "TRANSFORMATION" | "DELIVERY" = "DELIVERY"
) {
  if (failureStageId === "SOURCE") {
    return {
      errorCount: 1,
      topError,
      affectedRecords: 0,
      failureStageId: "SOURCE" as const,
      distribution: [{ errorCode: topError, count: 1 }],
    };
  }

  if (recordsFailed <= 0) return undefined;
  const distribution = [
    { errorCode: topError, count: Math.max(1, Math.floor(recordsFailed * 0.6)) },
    { errorCode: "INVALID_SKU", count: Math.max(0, Math.floor(recordsFailed * 0.25)) },
    { errorCode: "DUPLICATE_ORDER", count: Math.max(0, recordsFailed - Math.floor(recordsFailed * 0.85)) },
  ].filter((item) => item.count > 0);

  return {
    errorCount: recordsFailed,
    topError,
    affectedRecords: recordsFailed,
    failureStageId,
    distribution,
  };
}

function generateExecutions(tenants: Tenant[], integrations: Integration[]): Execution[] {
  const executions: Execution[] = [];
  const statusWeights = [
    ExecutionStatus.COMPLETED,
    ExecutionStatus.COMPLETED,
    ExecutionStatus.COMPLETED,
    ExecutionStatus.FAILED,
    ExecutionStatus.RUNNING,
    ExecutionStatus.QUEUED,
    ExecutionStatus.FAILED,
  ];

  for (let i = 1; i <= 3000; i++) {
    const integration = integrations[i % integrations.length];
    const startedAt = randomDate(30);
    const status = pick(statusWeights);
    const isFailed = status === ExecutionStatus.FAILED;
    const failureKind = isFailed ? (i % 3 === 0 ? "source" : "pipeline") : null;
    const timeline = buildTimeline(startedAt, status, failureKind === "source");
    const finishedAt =
      status === ExecutionStatus.RUNNING || status === ExecutionStatus.QUEUED
        ? undefined
        : timeline[timeline.length - 1].timestamp;
    const durationMs = finishedAt ? finishedAt.getTime() - startedAt.getTime() : 9900 + Math.floor(Math.random() * 20000);
    const isPartial = status === ExecutionStatus.COMPLETED && i % 7 === 0;

    let recordsProcessed: number;
    let recordsFailed: number;
    let recordsSuccess: number;
    let chunkCount: number;
    let chunksCompleted: number;
    let chunksFailed: number;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;

    if (failureKind === "source") {
      recordsProcessed = 0;
      recordsFailed = 0;
      recordsSuccess = 0;
      chunkCount = 0;
      chunksCompleted = 0;
      chunksFailed = 0;
      errorCode = pick(SOURCE_ERROR_CODES);
      errorMessage = pick(SOURCE_ERROR_MESSAGES);
    } else {
      recordsProcessed = 100 + Math.floor(Math.random() * 5000);
      recordsFailed = isFailed
        ? 1 + Math.floor(Math.random() * 100)
        : isPartial
          ? 1 + Math.floor(Math.random() * 20)
          : 0;
      recordsSuccess = recordsProcessed - recordsFailed;
      chunkCount = 10 + Math.floor(Math.random() * 50);
      chunksFailed = isFailed ? Math.max(1, Math.floor(Math.random() * 3)) : 0;
      chunksCompleted = chunkCount - chunksFailed;
      errorCode = isFailed || isPartial ? pick(ERROR_CODES) : undefined;
      errorMessage = isFailed
        ? pick([
            "Destination authentication token expired while sending data.",
            "SAP request timed out after 30000ms",
            "Mapping validation failed: required field 'sku' is missing",
            "Duplicate order rejected by destination",
          ])
        : undefined;
    }

    const dlqRecordCount =
      failureKind === "pipeline" && recordsFailed > 0
        ? recordsFailed
        : isPartial && recordsFailed > 0
          ? recordsFailed
          : 0;
    const awaitingRetry = isFailed && failureKind === "pipeline" && i % 4 === 0;
    const retryCount = awaitingRetry
      ? 1 + Math.floor(Math.random() * 3)
      : isFailed
        ? Math.floor(Math.random() * 2)
        : 0;
    const durationSeconds = (durationMs ?? 9900) / 1000;
    const isRunning =
      status === ExecutionStatus.RUNNING ||
      status === ExecutionStatus.QUEUED ||
      status === ExecutionStatus.VALIDATING ||
      status === ExecutionStatus.MAPPING ||
      status === ExecutionStatus.TRANSFORMING ||
      status === ExecutionStatus.ROUTING ||
      status === ExecutionStatus.DELIVERING;
    const executionStages = buildExecutionStages(
      durationMs ?? 9900,
      recordsProcessed,
      recordsFailed,
      isFailed,
      isRunning,
      errorCode,
      errorMessage,
      failureKind === "source" ? "SOURCE" : "DELIVERY"
    );
    const nextRetryAt = awaitingRetry
      ? new Date((finishedAt ?? startedAt).getTime() + 360000)
      : undefined;
    const operationalInsight = buildOperationalInsight(status, {
      stages: executionStages,
      recordsProcessed,
      recordsFailed,
      chunksFailed,
      chunkCount,
      chunksCompleted,
      apiCalls: chunkCount * 4 + Math.floor(Math.random() * 50),
      averageResponseTimeMs: 80 + Math.floor(Math.random() * 400),
      recordsPerSecond: Math.round((recordsProcessed / Math.max(durationSeconds, 1)) * 10) / 10,
      durationMs: durationMs ?? 9900,
      startedAt,
      finishedAt,
      errorCode,
      errorMessage,
      retryCount,
      nextRetryAt,
    });

    executions.push({
      id: id("EXE", i),
      tenantId: integration.tenantId,
      integrationId: integration.id,
      triggerType: integration.triggerType,
      status,
      environment: pick(ENVIRONMENTS),
      startedAt,
      finishedAt,
      durationMs,
      retryCount,
      chunkCount,
      chunksCompleted,
      chunksFailed,
      recordsProcessed,
      recordsSuccess,
      recordsFailed,
      dlqRecordCount,
      apiCalls: chunkCount * 4 + Math.floor(Math.random() * 50),
      averageResponseTimeMs: 80 + Math.floor(Math.random() * 400),
      recordsPerSecond: Math.round((recordsProcessed / Math.max(durationSeconds, 1)) * 10) / 10,
      chunkThroughput: Math.round((chunkCount / Math.max(durationSeconds, 1)) * 10) / 10,
      timeline,
      executionStages,
      operationalInsight,
      retrySummary: {
        enabled: retryCount > 0,
        strategy: RetryStrategy.EXPONENTIAL,
        maxAttempts: 5,
        currentAttempt: retryCount,
        nextRetryAt,
      },
      errorSummary: buildErrorSummary(
        recordsFailed,
        errorCode ?? "SAP_TIMEOUT",
        failureKind === "source" ? "SOURCE" : "DELIVERY"
      ),
      dlqSummary:
        dlqRecordCount > 0
          ? {
              recordCount: dlqRecordCount,
              reason: errorCode === "SAP_TIMEOUT" ? "SAP Timeout" : "Delivery failure",
              status: DlqStatus.OPEN,
            }
          : undefined,
      errorMessage,
      errorCode,
      createdAt: startedAt,
      updatedAt: finishedAt ?? startedAt,
    });
  }
  return executions;
}

function generateDlqRecords(_tenants: Tenant[], integrations: Integration[], executions: Execution[]): DlqRecord[] {
  const records: DlqRecord[] = [];
  let counter = 1;
  const stages = [
    ExecutionStatus.VALIDATING,
    ExecutionStatus.MAPPING,
    ExecutionStatus.TRANSFORMING,
    ExecutionStatus.ROUTING,
    ExecutionStatus.DELIVERING,
  ];
  const statuses = [DlqStatus.OPEN, DlqStatus.IN_PROGRESS, DlqStatus.RESOLVED, DlqStatus.REPLAYED];
  const executionsWithDlq = executions.filter((e) => e.dlqRecordCount > 0);

  for (const execution of executionsWithDlq) {
    const integration = integrations.find((int) => int.id === execution.integrationId);
    if (!integration) continue;

    const errorCode = execution.errorCode ?? pick(ERROR_CODES);
    const rowsToCreate = Math.min(execution.dlqRecordCount, 50);

    for (let j = 0; j < rowsToCreate; j++) {
      const createdAt = randomDate(14);
      records.push({
        id: id("DLQ", counter++),
        tenantId: execution.tenantId,
        executionId: execution.id,
        integrationId: integration.id,
        stage:
          execution.errorSummary?.failureStageId === "DELIVERY"
            ? ExecutionStatus.DELIVERING
            : pick(stages),
        errorCode: j === 0 ? errorCode : `ERR_${String(100 + (j % 50)).padStart(3, "0")}`,
        errorMessage:
          execution.errorMessage ??
          pick([
            "Required field validation failed",
            "Connection timeout after 30000ms",
            "Schema mismatch: unexpected field type",
            "Rate limit exceeded",
            "Authentication token expired",
          ]),
        retryCount: Math.floor(Math.random() * 5),
        status: j === 0 ? DlqStatus.OPEN : statuses[j % statuses.length],
        payload: { orderId: `ORD-${execution.id}-${j + 1}`, sku: `SKU-${counter}`, quantity: 1 },
        stackTrace: "Error at MappingStage.validate\n  at line 142 in mapping-engine.ts\n  at async processRecord",
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return records;
}

function generateErrorRecords(integrations: Integration[], executions: Execution[]): ExecutionErrorRecord[] {
  const records: ExecutionErrorRecord[] = [];
  let counter = 1;
  const fieldPaths = ["lineItems[].sku", "orderId", "customer.email", "shipping.address.zipCode", "items[].quantity"];

  for (const execution of executions) {
    const summary = execution.errorSummary;
    if (!summary || summary.errorCount === 0) continue;

    const integration = integrations.find((int) => int.id === execution.integrationId);
    if (!integration) continue;

    const stageId = summary.failureStageId ?? "DELIVERY";
    const rowsToCreate = Math.min(summary.errorCount, 50);
    const errorCodes = summary.distribution
      .flatMap((item) => Array(Math.min(item.count, rowsToCreate)).fill(item.errorCode))
      .slice(0, rowsToCreate);

    while (errorCodes.length < rowsToCreate) {
      errorCodes.push(summary.topError ?? pick(ERROR_CODES));
    }

    for (let j = 0; j < rowsToCreate; j++) {
      const errorCode = errorCodes[j] ?? summary.topError ?? "UNKNOWN";
      const createdAt = execution.finishedAt ?? execution.startedAt;
      const isSource = stageId === "SOURCE";

      records.push({
        id: id("ERR", counter++),
        tenantId: execution.tenantId,
        executionId: execution.id,
        integrationId: integration.id,
        recordKey: isSource
          ? execution.id
          : `ORD-${execution.id.replace("EXE-", "")}-${String(j + 1).padStart(4, "0")}`,
        stageId,
        chunkNumber: isSource ? undefined : 1 + (j % Math.max(execution.chunkCount, 1)),
        errorCode,
        errorMessage: isSource
          ? (execution.errorMessage ?? pick(SOURCE_ERROR_MESSAGES))
          : pick([
              "Required field validation failed",
              "Destination rejected duplicate order reference",
              "Invalid SKU mapping for destination catalog",
              execution.errorMessage ?? "Record failed during pipeline processing.",
            ]),
        fieldPath: isSource ? undefined : pick(fieldPaths),
        payload: isSource
          ? { executionId: execution.id, source: "batch-file.csv" }
          : { orderId: `ORD-${j + 1}`, sku: `SKU-${1000 + j}`, quantity: 1 + (j % 5) },
        stackTrace: isSource
          ? undefined
          : "Error at DeliveryStage.send\n  at line 89 in delivery-client.ts\n  at async processChunk",
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return records;
}

function generateRetryRecords(tenants: Tenant[], executions: Execution[]): RetryRecord[] {
  const retryExecutions = executions.filter((e) => e.retryCount > 0);
  const records: RetryRecord[] = [];
  const strategies = [RetryStrategy.FIXED, RetryStrategy.EXPONENTIAL, RetryStrategy.LINEAR];
  const statuses = [RetryStatus.PENDING, RetryStatus.IN_PROGRESS, RetryStatus.COMPLETED, RetryStatus.EXHAUSTED];

  for (let i = 1; i <= 200; i++) {
    const execution = retryExecutions[i % retryExecutions.length] ?? executions[i % executions.length];
    const createdAt = randomDate(7);
    records.push({
      id: id("RTY", i),
      tenantId: execution.tenantId,
      executionId: execution.id,
      attempt: 1 + (i % 5),
      strategy: pick(strategies),
      nextRetryAt: new Date(Date.now() + Math.random() * 3600000),
      status: statuses[i % statuses.length],
      lastError: "Connection refused: ECONNREFUSED",
      createdAt,
      updatedAt: createdAt,
    });
  }
  return records;
}

function generateCircuitBreakers(tenants: Tenant[], providers: Provider[], connections: Connection[]): CircuitBreaker[] {
  const records: CircuitBreaker[] = [];
  const states = [CircuitBreakerState.CLOSED, CircuitBreakerState.CLOSED, CircuitBreakerState.OPEN, CircuitBreakerState.HALF_OPEN];

  for (let i = 1; i <= 50; i++) {
    const connection = connections[i % connections.length];
    const provider = providers.find((p) => p.id === connection.providerId)!;
    const createdAt = randomDate(60);
    const state = states[i % states.length];
    records.push({
      id: id("CBK", i),
      tenantId: connection.tenantId,
      providerId: provider.id,
      connectionId: connection.id,
      state,
      failureCount: state === CircuitBreakerState.OPEN ? 5 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 3),
      lastFailureAt: state !== CircuitBreakerState.CLOSED ? randomDate(1) : undefined,
      nextProbeAt: state === CircuitBreakerState.OPEN ? new Date(Date.now() + 60000) : undefined,
      threshold: 5,
      createdAt,
      updatedAt: randomDate(1),
    });
  }
  return records;
}

function generatePlatformUsers(tenants: Tenant[]): PlatformUser[] {
  const defs: Array<{
    name: string;
    email: string;
    role: PlatformUserRole;
    status: PlatformUserStatus;
    allTenantsAccess: boolean;
    tenantIds: string[];
  }> = [
    {
      name: "Admin User",
      email: "admin@commerceone.io",
      role: PlatformUserRole.PLATFORM_ADMIN,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: true,
      tenantIds: [],
    },
    {
      name: "Ops Manager",
      email: "ops@commerceone.io",
      role: PlatformUserRole.TENANT_OPERATOR,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(0, 8).map((t) => t.id),
    },
    {
      name: "Integration Engineer",
      email: "integration@commerceone.io",
      role: PlatformUserRole.TENANT_OPERATOR,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(2, 10).map((t) => t.id),
    },
    {
      name: "Support Agent",
      email: "support@commerceone.io",
      role: PlatformUserRole.TENANT_VIEWER,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(0, 5).map((t) => t.id),
    },
    {
      name: "Finance Analyst",
      email: "finance@commerceone.io",
      role: PlatformUserRole.TENANT_VIEWER,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(5, 9).map((t) => t.id),
    },
    {
      name: "Regional Lead",
      email: "regional@commerceone.io",
      role: PlatformUserRole.TENANT_OPERATOR,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(10, 16).map((t) => t.id),
    },
    {
      name: "Security Auditor",
      email: "security@commerceone.io",
      role: PlatformUserRole.TENANT_VIEWER,
      status: PlatformUserStatus.INACTIVE,
      allTenantsAccess: false,
      tenantIds: tenants.slice(0, 3).map((t) => t.id),
    },
    {
      name: "Partner Admin",
      email: "partner@commerceone.io",
      role: PlatformUserRole.TENANT_OPERATOR,
      status: PlatformUserStatus.ACTIVE,
      allTenantsAccess: false,
      tenantIds: [tenants[12]?.id, tenants[13]?.id].filter(Boolean) as string[],
    },
  ];

  return defs.map((user, i) => {
    const createdAt = randomDate(180);
    return {
      id: id("USR", i + 1),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      allTenantsAccess: user.allTenantsAccess,
      tenantIds: user.tenantIds,
      lastLoginAt: user.status === PlatformUserStatus.ACTIVE ? randomDate(14) : undefined,
      createdAt,
      updatedAt: randomDate(30),
    };
  });
}

function generateAuditLogs(tenants: Tenant[]): AuditLog[] {
  const users = [
    { id: id("USR", 1), name: "Admin User" },
    { id: id("USR", 2), name: "Ops Manager" },
    { id: id("USR", 3), name: "Integration Engineer" },
    { id: id("USR", 4), name: "Support Agent" },
  ];
  const actions = [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DELETE, AuditAction.EXECUTE, AuditAction.REPLAY, AuditAction.TEST];
  const resources = ["Tenant", "Connection", "Integration", "Execution", "DLQ Record", "Circuit Breaker"];
  const results = [AuditResult.SUCCESS, AuditResult.SUCCESS, AuditResult.FAILURE, AuditResult.PARTIAL];

  return Array.from({ length: 100 }, (_, i) => {
    const user = users[i % users.length];
    const createdAt = randomDate(30);
    return {
      id: id("AUD", i + 1),
      tenantId: tenants[i % tenants.length].id,
      userId: user.id,
      userName: user.name,
      action: actions[i % actions.length],
      resource: resources[i % resources.length],
      resourceId: id("RES", i + 1),
      result: results[i % results.length],
      details: `Performed ${actions[i % actions.length]} on ${resources[i % resources.length]}`,
      ipAddress: `10.0.${Math.floor(i / 256)}.${i % 256}`,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

export interface MockDatabase {
  providers: Provider[];
  tenants: Tenant[];
  connections: Connection[];
  integrations: Integration[];
  executions: Execution[];
  errorRecords: ExecutionErrorRecord[];
  dlqRecords: DlqRecord[];
  retryRecords: RetryRecord[];
  circuitBreakers: CircuitBreaker[];
  auditLogs: AuditLog[];
  validationProfiles: ValidationProfile[];
  mappingProfiles: MappingProfile[];
  transformationProfiles: TransformationProfile[];
  routingProfiles: RoutingProfile[];
  executionPolicies: ExecutionPolicy[];
  retryPolicies: RetryPolicy[];
  retentionPolicies: RetentionPolicy[];
  platformSettings: PlatformSettings;
  platformUsers: PlatformUser[];
}

let cachedDb: MockDatabase | null = null;

export function getMockDatabase(): MockDatabase {
  if (cachedDb) return cachedDb;

  const providers = generateProviders();
  const tenants = generateTenants();
  const profiles = generateProfiles();
  const connections = generateConnections(tenants, providers);
  const integrations = generateIntegrations(tenants, connections, providers, profiles);
  const executions = generateExecutions(tenants, integrations);
  const errorRecords = generateErrorRecords(integrations, executions);
  const dlqRecords = generateDlqRecords(tenants, integrations, executions);
  const retryRecords = generateRetryRecords(tenants, executions);
  const circuitBreakers = generateCircuitBreakers(tenants, providers, connections);
  applyIntegrationCircuitBreakerStatus(integrations, circuitBreakers);
  const platformUsers = generatePlatformUsers(tenants);
  const auditLogs = generateAuditLogs(tenants);

  cachedDb = {
    providers,
    tenants,
    connections,
    integrations,
    executions,
    errorRecords,
    dlqRecords,
    retryRecords,
    circuitBreakers,
    platformUsers,
    auditLogs,
    ...profiles,
    platformSettings: {
      id: "PLT-001",
      platformName: "CommerceOne Integration Hub",
      defaultTimezone: "UTC",
      maxConcurrentExecutions: 100,
      defaultRetryPolicyId: profiles.retryPolicies[0].id,
      defaultExecutionPolicyId: profiles.executionPolicies[0].id,
      workerCount: 24,
      maintenanceMode: false,
      updatedAt: new Date(),
    },
  };

  return cachedDb;
}

export function resetMockDatabase(): void {
  cachedDb = null;
}
