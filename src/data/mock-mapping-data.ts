import type {
  MappingRule,
  MappingTemplate,
  SchemaField,
  TransformRule,
  ValidationRule,
} from "@/types/mapping";

const ORDER_SOURCE_SCHEMA: SchemaField[] = [
  {
    name: "order",
    type: "object",
    children: [
      { name: "order_id", type: "string", mapped: true },
      { name: "order_number", type: "string", mapped: true },
      { name: "order_status", type: "string", mapped: true },
      { name: "order_date", type: "datetime", mapped: true },
      { name: "update_time", type: "datetime", mapped: false },
    ],
  },
  {
    name: "customer",
    type: "object",
    children: [
      { name: "customer_id", type: "string", mapped: true },
      { name: "customer_name", type: "string", mapped: true },
      { name: "customer_email", type: "string", mapped: true },
      { name: "customer_phone", type: "string", mapped: false },
    ],
  },
  {
    name: "shipping_address",
    type: "object",
    children: [
      { name: "name", type: "string", mapped: true },
      { name: "address1", type: "string", mapped: true },
      { name: "address2", type: "string", mapped: false },
      { name: "city", type: "string", mapped: true },
      { name: "postal_code", type: "string", mapped: true },
    ],
  },
  {
    name: "items",
    type: "array",
    children: [
      { name: "sku", type: "string", mapped: true },
      { name: "quantity", type: "number", mapped: true },
      { name: "price", type: "number", mapped: true },
    ],
  },
];

const SAP_ORDER_DEST_SCHEMA: SchemaField[] = [
  {
    name: "sales_order",
    type: "object",
    children: [
      { name: "sales_order_no", type: "string", required: true, mapped: true },
      { name: "reference_no", type: "string", mapped: true },
      { name: "document_date", type: "date", required: true, mapped: true },
      { name: "posting_date", type: "date", mapped: false },
      { name: "sold_to_party", type: "string", required: true, mapped: true },
      { name: "sold_to_name", type: "string", mapped: true },
      { name: "net_amount", type: "decimal", required: true, mapped: true },
      { name: "currency", type: "string", required: true, mapped: true },
    ],
  },
  {
    name: "ship_to_address",
    type: "object",
    children: [
      { name: "ship_to_name", type: "string", mapped: true },
      { name: "ship_to_address1", type: "string", mapped: true },
      { name: "ship_to_address2", type: "string", mapped: false },
      { name: "ship_to_city", type: "string", mapped: true },
      { name: "ship_to_postcode", type: "string", mapped: true },
    ],
  },
  {
    name: "items",
    type: "array",
    children: [
      { name: "material_code", type: "string", required: true, mapped: true },
      { name: "quantity", type: "number", required: true, mapped: true },
      { name: "unit_price", type: "decimal", mapped: true },
    ],
  },
];

function buildOrderMappingRules(prefix: string): MappingRule[] {
  const rows: Omit<MappingRule, "id">[] = [
    { sourceField: "order_id", sourceType: "string", destinationField: "sales_order_no", destinationType: "string", mappingType: "DIRECT", confidence: 98, status: "MAPPED", validationRuleIds: ["v1", "v2"] },
    { sourceField: "order_number", sourceType: "string", destinationField: "reference_no", destinationType: "string", mappingType: "DIRECT", confidence: 96, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "order_date", sourceType: "datetime", destinationField: "document_date", destinationType: "date", mappingType: "TRANSFORM", confidence: 91, status: "NEED_REVIEW", validationRuleIds: ["v1", "v3"], transformRuleId: "t1", sampleInput: "2024-05-16T14:22:33+07:00", sampleOutput: "2024-05-16" },
    { sourceField: "customer.customer_id", sourceType: "string", destinationField: "sold_to_party", destinationType: "string", mappingType: "LOOKUP", confidence: 88, status: "NEED_REVIEW", validationRuleIds: ["v1"], transformRuleId: "t2" },
    { sourceField: "customer.customer_name", sourceType: "string", destinationField: "sold_to_name", destinationType: "string", mappingType: "DIRECT", confidence: 95, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "total_amount", sourceType: "decimal", destinationField: "net_amount", destinationType: "decimal", mappingType: "FORMULA", confidence: 85, status: "NEED_REVIEW", validationRuleIds: ["v4", "v5"], transformRuleId: "t3", sampleInput: 1000, sampleOutput: 1070 },
    { sourceField: "currency", sourceType: "string", destinationField: "currency", destinationType: "string", mappingType: "DIRECT", confidence: 99, status: "MAPPED", validationRuleIds: ["v6"] },
    { sourceField: "shipping_address.name", sourceType: "string", destinationField: "ship_to_name", destinationType: "string", mappingType: "DIRECT", confidence: 93, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "shipping_address.address1", sourceType: "string", destinationField: "ship_to_address1", destinationType: "string", mappingType: "DIRECT", confidence: 92, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "shipping_address.city", sourceType: "string", destinationField: "ship_to_city", destinationType: "string", mappingType: "DIRECT", confidence: 94, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "shipping_address.postal_code", sourceType: "string", destinationField: "ship_to_postcode", destinationType: "string", mappingType: "DIRECT", confidence: 90, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "items.sku", sourceType: "string", destinationField: "items.material_code", destinationType: "string", mappingType: "DIRECT", confidence: 97, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "items.quantity", sourceType: "number", destinationField: "items.quantity", destinationType: "number", mappingType: "DIRECT", confidence: 98, status: "MAPPED", validationRuleIds: ["v5"] },
    { sourceField: "items.price", sourceType: "decimal", destinationField: "items.unit_price", destinationType: "decimal", mappingType: "DIRECT", confidence: 96, status: "MAPPED", validationRuleIds: ["v5"] },
    { sourceField: "order_status", sourceType: "string", destinationField: "order_status_code", destinationType: "string", mappingType: "LOOKUP", confidence: 82, status: "NEED_REVIEW", validationRuleIds: ["v1"], transformRuleId: "t4" },
    { sourceField: "customer.customer_email", sourceType: "string", destinationField: "customer_email", destinationType: "string", mappingType: "DIRECT", confidence: 87, status: "NEED_REVIEW", validationRuleIds: ["v7"] },
    { sourceField: "payment_method", sourceType: "string", destinationField: "payment_type", destinationType: "string", mappingType: "LOOKUP", confidence: 80, status: "NEED_REVIEW", validationRuleIds: ["v1"], transformRuleId: "t5" },
    { sourceField: "shipping_fee", sourceType: "decimal", destinationField: "freight_amount", destinationType: "decimal", mappingType: "DIRECT", confidence: 89, status: "MAPPED", validationRuleIds: ["v5"] },
    { sourceField: "discount_amount", sourceType: "decimal", destinationField: "discount_total", destinationType: "decimal", mappingType: "FORMULA", confidence: 84, status: "NEED_REVIEW", validationRuleIds: ["v5"], transformRuleId: "t6" },
    { sourceField: "warehouse_code", sourceType: "string", destinationField: "plant", destinationType: "string", mappingType: "LOOKUP", confidence: 79, status: "NEED_REVIEW", validationRuleIds: ["v1"], transformRuleId: "t7" },
    { sourceField: "notes", sourceType: "string", destinationField: "header_text", destinationType: "string", mappingType: "CONCAT", confidence: 75, status: "NEED_REVIEW", validationRuleIds: ["v8"], transformRuleId: "t8" },
    { sourceField: "tax_amount", sourceType: "decimal", destinationField: "tax_total", destinationType: "decimal", mappingType: "FORMULA", confidence: 83, status: "NEED_REVIEW", validationRuleIds: ["v5"], transformRuleId: "t9" },
    { sourceField: "channel", sourceType: "string", destinationField: "distribution_channel", destinationType: "string", mappingType: "CONSTANT", confidence: 100, status: "MAPPED", validationRuleIds: ["v1"] },
    { sourceField: "update_time", sourceType: "datetime", destinationField: "last_modified", destinationType: "datetime", mappingType: "TRANSFORM", confidence: 90, status: "MAPPED", validationRuleIds: ["v3"], transformRuleId: "t10" },
  ];
  return rows.map((r, i) => ({ ...r, id: `${prefix}-mr-${i + 1}` }));
}

const ORDER_VALIDATION_RULES: ValidationRule[] = [
  { id: "v1", field: "sales_order_no", ruleType: "Required", severity: "ERROR", message: "Sales order number is required", source: "TEMPLATE" },
  { id: "v2", field: "sales_order_no", ruleType: "Unique", severity: "ERROR", message: "Sales order number must be unique", source: "TEMPLATE" },
  { id: "v3", field: "document_date", ruleType: "Valid Date", severity: "ERROR", message: "Document date must be valid ISO date", source: "TEMPLATE" },
  { id: "v4", field: "net_amount", ruleType: "Required", severity: "ERROR", message: "Net amount is required", source: "TEMPLATE" },
  { id: "v5", field: "net_amount", ruleType: "Min 0", severity: "ERROR", message: "Net amount must be >= 0", source: "TEMPLATE" },
  { id: "v6", field: "currency", ruleType: "ISO Currency", severity: "ERROR", message: "Currency must be ISO 4217", source: "TEMPLATE" },
  { id: "v7", field: "customer_email", ruleType: "Email Format", severity: "WARNING", message: "Email must be valid format", source: "CUSTOM" },
  { id: "v8", field: "header_text", ruleType: "Max Length", severity: "WARNING", message: "Header text max 255 chars", source: "TEMPLATE" },
  { id: "v9", field: "sold_to_party", ruleType: "Required", severity: "ERROR", message: "Sold-to party is required", source: "TEMPLATE" },
  { id: "v10", field: "items.quantity", ruleType: "Is Number", severity: "ERROR", message: "Quantity must be numeric", source: "TEMPLATE" },
  { id: "v11", field: "items.material_code", ruleType: "Required", severity: "ERROR", message: "Material code required per line", source: "TEMPLATE" },
  { id: "v12", field: "ship_to_postcode", ruleType: "Is Not Empty", severity: "WARNING", message: "Postcode should not be empty", source: "TEMPLATE" },
];

const ORDER_TRANSFORM_RULES: TransformRule[] = [
  { id: "t1", sourceField: "order_date", destinationField: "document_date", transformType: "Date Format", config: { inputFormat: "ISO8601", outputFormat: "yyyy-MM-dd", timezone: "Asia/Bangkok" }, description: "Convert ISO datetime to yyyy-MM-dd", sampleInput: "2024-05-16T14:22:33+07:00", sampleOutput: "2024-05-16" },
  { id: "t2", sourceField: "customer.customer_id", destinationField: "sold_to_party", transformType: "Lookup", config: { lookupTable: "CUSTOMER_MASTER", sourceKey: "marketplace_id", targetField: "sap_customer_id" }, description: "Lookup SAP customer ID from marketplace ID" },
  { id: "t3", sourceField: "total_amount", destinationField: "net_amount", transformType: "Formula", config: { formula: "amount * 1.07" }, description: "Apply VAT multiplier", sampleInput: 1000, sampleOutput: 1070 },
  { id: "t4", sourceField: "order_status", destinationField: "order_status_code", transformType: "Lookup", config: { lookupTable: "STATUS_MAP" }, description: "Map marketplace status to SAP code" },
  { id: "t5", sourceField: "payment_method", destinationField: "payment_type", transformType: "Lookup", config: { lookupTable: "PAYMENT_MAP" }, description: "Map payment method" },
  { id: "t6", sourceField: "discount_amount", destinationField: "discount_total", transformType: "Formula", config: { formula: "discount * -1" }, description: "Negate discount for SAP" },
  { id: "t7", sourceField: "warehouse_code", destinationField: "plant", transformType: "Lookup", config: { lookupTable: "PLANT_MAP" }, description: "Map warehouse to SAP plant" },
  { id: "t8", sourceField: "notes", destinationField: "header_text", transformType: "Trim", config: {}, description: "Remove whitespace from notes", sampleInput: "  Rush order  ", sampleOutput: "Rush order" },
  { id: "t9", sourceField: "tax_amount", destinationField: "tax_total", transformType: "Formula", config: { formula: "tax_amount" }, description: "Pass tax amount" },
  { id: "t10", sourceField: "update_time", destinationField: "last_modified", transformType: "Date Format", config: { outputFormat: "ISO8601" }, description: "Normalize datetime" },
];

function buildTemplate(
  code: string,
  name: string,
  source: string,
  dest: string,
  dataFlow: string,
  confidence: number
): MappingTemplate {
  const prefix = code.toLowerCase().replace(/_/g, "-");
  return {
    id: `tpl-${prefix}`,
    code,
    name,
    sourceProviderCode: source,
    destinationProviderCode: dest,
    dataFlowCode: dataFlow,
    confidence,
    mappingRules: buildOrderMappingRules(prefix),
    validationRules: ORDER_VALIDATION_RULES,
    transformRules: ORDER_TRANSFORM_RULES,
    sourceSchema: ORDER_SOURCE_SCHEMA,
    destinationSchema: SAP_ORDER_DEST_SCHEMA,
  };
}

export const MOCK_MAPPING_TEMPLATES: MappingTemplate[] = [
  buildTemplate("LAZADA_ORDER_TO_SAP_ORDER", "Lazada Order to SAP Order", "LAZADA", "SAP", "ORDERS", 96),
  buildTemplate("SHOPEE_ORDER_TO_SAP_ORDER", "Shopee Order to SAP Order", "SHOPEE", "SAP", "ORDERS", 95),
  buildTemplate("TIKTOK_ORDER_TO_SAP_ORDER", "TikTok Order to SAP Order", "TIKTOK", "SAP", "ORDERS", 94),
  buildTemplate("SFTP_PRODUCT_TO_SAP_PRODUCT", "SFTP Product to SAP Material", "SFTP", "SAP", "PRODUCT_FILE_IMPORT", 92),
  buildTemplate("SFTP_INVENTORY_TO_SAP_INVENTORY", "SFTP Inventory to SAP Stock", "SFTP", "SAP", "INVENTORY_FILE_IMPORT", 91),
  buildTemplate("REST_ORDER_TO_WEBHOOK_ORDER", "REST Order to Webhook", "REST", "WEBHOOK", "ORDERS", 89),
];

export function findTemplateKey(source: string, dataFlow: string, dest: string): string {
  const s = source.toUpperCase();
  const d = dest.toUpperCase();
  const f = dataFlow.toUpperCase();
  if (f.includes("PRODUCT") && s.includes("SFTP")) return "SFTP_PRODUCT_TO_SAP_PRODUCT";
  if (f.includes("INVENTORY") && s.includes("SFTP")) return "SFTP_INVENTORY_TO_SAP_INVENTORY";
  if (d === "WEBHOOK" || d.includes("WEBHOOK")) return "REST_ORDER_TO_WEBHOOK_ORDER";
  if (s.includes("LAZADA")) return "LAZADA_ORDER_TO_SAP_ORDER";
  if (s.includes("SHOPEE")) return "SHOPEE_ORDER_TO_SAP_ORDER";
  if (s.includes("TIKTOK")) return "TIKTOK_ORDER_TO_SAP_ORDER";
  if (f.includes("ORDER")) return `${s}_ORDER_TO_${d}_ORDER`.replace("REST", "REST");
  return `${s}_${f}_TO_${d}_${f}`.slice(0, 40);
}
