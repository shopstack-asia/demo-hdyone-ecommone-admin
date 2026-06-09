export type MappingType =
  | "DIRECT"
  | "TRANSFORM"
  | "FORMULA"
  | "CONSTANT"
  | "LOOKUP"
  | "CONCAT"
  | "CUSTOM";

export type MappingStatus = "MAPPED" | "NEED_REVIEW" | "UNMAPPED" | "ERROR";

export type MappingFilter = "ALL" | "NEED_REVIEW" | "UNMAPPED" | "MAPPED";

export interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  mapped?: boolean;
  children?: SchemaField[];
}

export interface MappingRule {
  id: string;
  sourceField: string;
  sourceType: string;
  destinationField: string;
  destinationType: string;
  mappingType: MappingType;
  confidence: number;
  status: MappingStatus;
  validationRuleIds: string[];
  transformRuleId?: string;
  sampleInput?: unknown;
  sampleOutput?: unknown;
}

export interface ValidationRule {
  id: string;
  field: string;
  ruleType: string;
  severity: "ERROR" | "WARNING" | "INFO";
  message: string;
  source: "TEMPLATE" | "CUSTOM";
}

export interface TransformRule {
  id: string;
  sourceField: string;
  destinationField: string;
  transformType: string;
  config: Record<string, unknown>;
  description: string;
  sampleInput?: unknown;
  sampleOutput?: unknown;
}

export interface MappingTemplate {
  id: string;
  code: string;
  name: string;
  sourceProviderCode: string;
  destinationProviderCode: string;
  dataFlowCode: string;
  confidence: number;
  mappingRules: MappingRule[];
  validationRules: ValidationRule[];
  transformRules: TransformRule[];
  sourceSchema: SchemaField[];
  destinationSchema: SchemaField[];
}

export interface MappingSummary {
  mapped: number;
  needReview: number;
  unmapped: number;
  autoMapped: number;
  total: number;
  confidence: number;
}

export interface SuggestedMappingInput {
  sourceProviderCode: string;
  dataFlowCode: string;
  destinationProviderCode: string;
}
