import {
  MOCK_MAPPING_TEMPLATES,
  findTemplateKey,
} from "@/data/mock-mapping-data";
import type {
  MappingFilter,
  MappingRule,
  MappingSummary,
  MappingTemplate,
  SchemaField,
  SuggestedMappingInput,
  TransformRule,
  ValidationRule,
} from "@/types/mapping";

function cloneTemplate(template: MappingTemplate): MappingTemplate {
  return {
    ...template,
    mappingRules: template.mappingRules.map((r) => ({ ...r, validationRuleIds: [...r.validationRuleIds] })),
    validationRules: template.validationRules.map((r) => ({ ...r })),
    transformRules: template.transformRules.map((r) => ({ ...r, config: { ...r.config } })),
    sourceSchema: JSON.parse(JSON.stringify(template.sourceSchema)) as SchemaField[],
    destinationSchema: JSON.parse(JSON.stringify(template.destinationSchema)) as SchemaField[],
  };
}

export function getSuggestedMappingTemplate(
  input: SuggestedMappingInput
): MappingTemplate | null {
  const key = findTemplateKey(
    input.sourceProviderCode,
    input.dataFlowCode,
    input.destinationProviderCode
  );
  const found =
    MOCK_MAPPING_TEMPLATES.find((t) => t.code === key) ??
    MOCK_MAPPING_TEMPLATES.find(
      (t) =>
        t.sourceProviderCode.toUpperCase() === input.sourceProviderCode.toUpperCase() &&
        t.dataFlowCode.toUpperCase().includes(input.dataFlowCode.toUpperCase().slice(0, 6)) &&
        t.destinationProviderCode.toUpperCase() === input.destinationProviderCode.toUpperCase()
    ) ??
    MOCK_MAPPING_TEMPLATES[0];

  return found ? cloneTemplate(found) : null;
}

export function getSourceSchema(template: MappingTemplate): SchemaField[] {
  return template.sourceSchema;
}

export function getDestinationSchema(template: MappingTemplate): SchemaField[] {
  return template.destinationSchema;
}

export function getMappingRules(template: MappingTemplate): MappingRule[] {
  return template.mappingRules;
}

export function getValidationRules(template: MappingTemplate): ValidationRule[] {
  return template.validationRules;
}

export function getTransformRules(template: MappingTemplate): TransformRule[] {
  return template.transformRules;
}

export function computeMappingSummary(rules: MappingRule[]): MappingSummary {
  const mapped = rules.filter((r) => r.status === "MAPPED").length;
  const needReview = rules.filter((r) => r.status === "NEED_REVIEW").length;
  const unmapped = rules.filter((r) => r.status === "UNMAPPED").length;
  const autoMapped = rules.filter((r) => r.confidence >= 90 && r.status !== "UNMAPPED").length;
  const total = rules.length;
  const confidence =
    total === 0 ? 0 : Math.round(rules.reduce((sum, r) => sum + r.confidence, 0) / total);

  return { mapped, needReview, unmapped, autoMapped, total, confidence };
}

export function filterMappingRules(
  rules: MappingRule[],
  filter: MappingFilter,
  search: string,
  options?: { sourceField?: string; destinationField?: string }
): MappingRule[] {
  let result = [...rules];

  if (filter === "NEED_REVIEW") result = result.filter((r) => r.status === "NEED_REVIEW");
  else if (filter === "UNMAPPED") result = result.filter((r) => r.status === "UNMAPPED");
  else if (filter === "MAPPED") result = result.filter((r) => r.status === "MAPPED");

  if (options?.sourceField) {
    result = result.filter((r) => r.sourceField === options.sourceField);
  }

  if (options?.destinationField) {
    result = result.filter((r) => r.destinationField === options.destinationField);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (r) =>
        r.sourceField.toLowerCase().includes(q) ||
        r.destinationField.toLowerCase().includes(q) ||
        r.mappingType.toLowerCase().includes(q)
    );
  }

  return result;
}

export function updateMappingRule(
  rules: MappingRule[],
  id: string,
  patch: Partial<MappingRule>
): MappingRule[] {
  return rules.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function addMappingRule(rules: MappingRule[], rule: Omit<MappingRule, "id">): MappingRule[] {
  const id = `mr-custom-${Date.now()}`;
  return [...rules, { ...rule, id }];
}

export function deleteMappingRule(rules: MappingRule[], id: string): MappingRule[] {
  return rules.filter((r) => r.id !== id);
}

export function duplicateMappingRule(rules: MappingRule[], id: string): MappingRule[] {
  const source = rules.find((r) => r.id === id);
  if (!source) return rules;
  const copy: MappingRule = {
    ...source,
    id: `mr-dup-${Date.now()}`,
    destinationField: `${source.destinationField}_copy`,
    status: "NEED_REVIEW",
    confidence: 70,
  };
  return [...rules, copy];
}

export function autoMapFields(rules: MappingRule[]): MappingRule[] {
  return rules.map((r) => {
    if (r.status === "UNMAPPED") {
      return { ...r, status: "NEED_REVIEW" as const, confidence: 75, mappingType: "DIRECT" as const };
    }
    if (r.status === "NEED_REVIEW" && r.confidence < 90) {
      return { ...r, confidence: Math.min(r.confidence + 8, 94) };
    }
    return r;
  });
}

export function groupValidationRulesByField(
  rules: ValidationRule[]
): { field: string; rules: ValidationRule[] }[] {
  const map = new Map<string, ValidationRule[]>();
  for (const rule of rules) {
    const list = map.get(rule.field) ?? [];
    list.push(rule);
    map.set(rule.field, list);
  }
  return Array.from(map.entries()).map(([field, fieldRules]) => ({
    field,
    rules: fieldRules,
  }));
}

export function getTransformForRule(
  rule: MappingRule,
  transforms: TransformRule[]
): TransformRule | undefined {
  if (!rule.transformRuleId) return undefined;
  return transforms.find((t) => t.id === rule.transformRuleId);
}

export function getValidationRulesForMapping(
  rule: MappingRule,
  validations: ValidationRule[]
): ValidationRule[] {
  return validations.filter((v) => rule.validationRuleIds.includes(v.id));
}
