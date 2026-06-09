export interface ConnectionHealthMetrics {
  status: "HEALTHY" | "WARNING" | "ERROR";
  responseTimeMs: number;
  successRate: number;
  lastTested: string;
}

export interface ValidationResult {
  success: boolean;
  responseTimeMs: number;
  authStatus: string;
  providerVersion?: string;
  responseSummary: string;
  statusCode?: number;
  sampleResponse?: string;
  error?: string;
}

export interface MetadataSection {
  label: string;
  value: string;
}

export interface MetadataTreeItem {
  name: string;
  type: "folder" | "file" | "prefix";
  children?: MetadataTreeItem[];
}

export interface DiscoveredMetadata {
  title: string;
  subtitle?: string;
  sections: MetadataSection[];
  tree?: MetadataTreeItem[];
  raw?: Record<string, unknown>;
}

export interface ProviderAuthSetupProps {
  configuration: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBulkChange: (updates: Record<string, string>) => void;
  errors: Record<string, string>;
  oauthConnected?: boolean;
  mode?: "create" | "edit";
  onMarketplaceCredentialsChange?: (draft: Record<string, string>, dirty: boolean) => void;
}

export const WIZARD_STEPS = [
  "Provider",
  "Authentication",
  "Validation",
  "Metadata",
  "Review",
] as const;
