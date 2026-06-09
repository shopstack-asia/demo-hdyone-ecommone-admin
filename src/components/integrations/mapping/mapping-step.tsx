"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MappingContextSummary } from "./mapping-context-summary";
import { MappingTemplateCard } from "./mapping-template-card";
import { MappingSummaryCards } from "./mapping-summary-cards";
import { MappingToolbar } from "./mapping-toolbar";
import { MappingTable } from "./mapping-table";
import { MappingDetailPanel } from "./mapping-detail-panel";
import { ValidationRulesTab } from "./validation-rules-tab";
import { TransformRulesTab } from "./transform-rules-tab";
import { MappingIdempotencyTab } from "./mapping-idempotency-tab";
import { SchemaDrawer } from "./schema-drawer";
import { AddMappingDrawer } from "./add-mapping-drawer";
import {
  addMappingRule,
  autoMapFields,
  computeMappingSummary,
  deleteMappingRule,
  duplicateMappingRule,
  filterMappingRules,
  getSuggestedMappingTemplate,
  updateMappingRule,
} from "@/services/mapping-service";
import type { Connection, IntegrationIdempotencyConfig, Provider, ProviderDataFlow } from "@/types/domain";
import type { MappingFilter, MappingRule, MappingTemplate } from "@/types/mapping";
import { Fingerprint, GitBranch, Shield, Sparkles } from "lucide-react";

interface MappingStepProps {
  sourceProvider?: Provider;
  sourceConnection?: Connection;
  destinationProvider?: Provider;
  destinationConnection?: Connection;
  dataFlow?: ProviderDataFlow;
  mappingProfileCode?: string;
  onMappingProfileCodeChange?: (code: string) => void;
  idempotency?: IntegrationIdempotencyConfig;
  onIdempotencyChange?: (value: IntegrationIdempotencyConfig) => void;
  idempotencyPreviewContext?: {
    tenantId: string;
    integrationId: string;
    dataFlowCode?: string;
  };
}

type FieldFilter = { kind: "source" | "destination"; path: string };

export function MappingStep({
  sourceProvider,
  sourceConnection,
  destinationProvider,
  destinationConnection,
  dataFlow,
  mappingProfileCode,
  onMappingProfileCodeChange,
  idempotency,
  onIdempotencyChange,
  idempotencyPreviewContext,
}: MappingStepProps) {
  const [template, setTemplate] = useState<MappingTemplate | null>(null);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [originalRules, setOriginalRules] = useState<MappingRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("mapping");
  const [filter, setFilter] = useState<MappingFilter>("ALL");
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState<FieldFilter | undefined>();
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [destDrawerOpen, setDestDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<{
    sourceField?: string;
    sourceType?: string;
    destinationField?: string;
    destinationType?: string;
  }>({});

  const loadTemplate = useCallback(() => {
    if (!sourceProvider || !destinationProvider || !dataFlow) return null;
    return getSuggestedMappingTemplate({
      sourceProviderCode: sourceProvider.code.toUpperCase(),
      dataFlowCode: dataFlow.code,
      destinationProviderCode: destinationProvider.code.toUpperCase(),
    });
  }, [sourceProvider, destinationProvider, dataFlow]);

  useEffect(() => {
    const tpl = loadTemplate();
    if (!tpl) return;
    setTemplate(tpl);
    setMappingRules(tpl.mappingRules);
    setOriginalRules(tpl.mappingRules);
    setSelectedRuleId(undefined);
    setFieldFilter(undefined);
    onMappingProfileCodeChange?.(tpl.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when integration context changes only
  }, [sourceProvider?.code, destinationProvider?.code, dataFlow?.code]);

  const filteredRules = useMemo(
    () =>
      filterMappingRules(mappingRules, filter, search, {
        sourceField: fieldFilter?.kind === "source" ? fieldFilter.path : undefined,
        destinationField: fieldFilter?.kind === "destination" ? fieldFilter.path : undefined,
      }),
    [mappingRules, filter, search, fieldFilter]
  );

  const summary = useMemo(() => computeMappingSummary(mappingRules), [mappingRules]);
  const selectedRule = mappingRules.find((r) => r.id === selectedRuleId);

  const handleSaveRule = (id: string, patch: Partial<MappingRule>) => {
    setMappingRules((rules) => updateMappingRule(rules, id, patch));
  };

  const handleResetRule = (id: string) => {
    const original = originalRules.find((r) => r.id === id);
    if (original) {
      setMappingRules((rules) => updateMappingRule(rules, id, original));
    }
  };

  const handleDeleteRule = (id: string) => {
    setMappingRules((rules) => deleteMappingRule(rules, id));
    if (selectedRuleId === id) setSelectedRuleId(undefined);
  };

  const handleDuplicateRule = (id: string) => {
    setMappingRules((rules) => duplicateMappingRule(rules, id));
  };

  const handleAutoMap = () => {
    setMappingRules((rules) => autoMapFields(rules));
  };

  const openAddMapping = (draft?: typeof addDraft) => {
    setSelectedRuleId(undefined);
    setAddDraft(draft ?? {});
    setAddDrawerOpen(true);
  };

  const handleSaveNewMapping = (rule: Omit<MappingRule, "id">) => {
    setMappingRules((rules) => addMappingRule(rules, rule));
    setAddDraft({});
  };

  const handleSchemaAddMapping = (
    kind: "source" | "destination",
    fieldPath: string,
    fieldType: string
  ) => {
    openAddMapping(
      kind === "source"
        ? { sourceField: fieldPath, sourceType: fieldType }
        : { destinationField: fieldPath, destinationType: fieldType }
    );
  };

  const handleSchemaFilter = (kind: "source" | "destination", fieldPath: string) => {
    setFieldFilter({ kind, path: fieldPath });
    setActiveTab("mapping");
  };

  if (!template || !dataFlow) {
    return (
      <p className="text-sm text-muted-foreground">
        Complete source, data flow, and destination steps to configure field mapping.
      </p>
    );
  }

  return (
    <div className="space-y-4 -mx-1 sm:-mx-2">
      <MappingContextSummary
        sourceProvider={sourceProvider}
        sourceConnection={sourceConnection}
        dataFlow={dataFlow}
        destinationProvider={destinationProvider}
        destinationConnection={destinationConnection}
        templateCode={mappingProfileCode ?? template.code}
        templateConfidence={template.confidence}
      />

      <MappingTemplateCard templateCode={template.code} confidence={template.confidence} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="mapping" className="text-xs gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Mapping Rules
          </TabsTrigger>
          <TabsTrigger value="validation" className="text-xs gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Validation Rules
          </TabsTrigger>
          <TabsTrigger value="transform" className="text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Transform Rules
          </TabsTrigger>
          <TabsTrigger value="idempotency" className="text-xs gap-1.5">
            <Fingerprint className="h-3.5 w-3.5" />
            Idempotency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="mt-4 space-y-3">
          <MappingSummaryCards summary={summary} />
          <MappingToolbar
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            onAddMapping={() => openAddMapping()}
            onAutoMap={handleAutoMap}
            onBrowseSourceFields={() => setSourceDrawerOpen(true)}
            onBrowseDestinationFields={() => setDestDrawerOpen(true)}
            activeFieldFilter={fieldFilter?.path}
            onClearFieldFilter={() => setFieldFilter(undefined)}
          />

          <div
            className={
              selectedRule
                ? "grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 min-h-[520px]"
                : "min-h-[520px]"
            }
          >
            <MappingTable
              rules={filteredRules}
              validationRules={template.validationRules}
              transformRules={template.transformRules}
              selectedId={selectedRuleId}
              onSelect={setSelectedRuleId}
              onEdit={setSelectedRuleId}
              onDelete={handleDeleteRule}
              onDuplicate={handleDuplicateRule}
            />

            {selectedRule && (
              <div className="min-h-[360px] xl:min-h-[520px]">
                <MappingDetailPanel
                  rule={selectedRule}
                  validationRules={template.validationRules}
                  transformRules={template.transformRules}
                  onClose={() => setSelectedRuleId(undefined)}
                  onSave={(patch) => handleSaveRule(selectedRule.id, patch)}
                  onReset={() => handleResetRule(selectedRule.id)}
                  onDelete={() => handleDeleteRule(selectedRule.id)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <ValidationRulesTab rules={template.validationRules} />
        </TabsContent>

        <TabsContent value="transform" className="mt-4">
          <TransformRulesTab rules={template.transformRules} />
        </TabsContent>

        <TabsContent value="idempotency" className="mt-4">
          {idempotencyPreviewContext && onIdempotencyChange ? (
            <MappingIdempotencyTab
              value={idempotency}
              onChange={onIdempotencyChange}
              previewContext={idempotencyPreviewContext}
              sourceSchema={template.sourceSchema}
              destinationSchema={template.destinationSchema}
            />
          ) : (
            <MappingIdempotencyTab
              value={idempotency}
              onChange={() => {}}
              previewContext={{
                tenantId: "tenant_001",
                integrationId: "integration",
                dataFlowCode: dataFlow.code,
              }}
              sourceSchema={template.sourceSchema}
              destinationSchema={template.destinationSchema}
              readOnly
            />
          )}
        </TabsContent>
      </Tabs>

      <SchemaDrawer
        open={sourceDrawerOpen}
        onOpenChange={setSourceDrawerOpen}
        side="left"
        title="Source Schema"
        description="Browse source fields. Select a field to add a mapping or filter the table."
        schema={template.sourceSchema}
        searchPlaceholder="Search source fields..."
        variant="source"
        onAddMapping={(path, type) => handleSchemaAddMapping("source", path, type)}
        onFilterTable={(path) => handleSchemaFilter("source", path)}
      />

      <SchemaDrawer
        open={destDrawerOpen}
        onOpenChange={setDestDrawerOpen}
        side="right"
        title="Destination Schema"
        description="Browse destination fields. Required fields are marked with *."
        schema={template.destinationSchema}
        searchPlaceholder="Search destination fields..."
        variant="destination"
        onAddMapping={(path, type) => handleSchemaAddMapping("destination", path, type)}
        onFilterTable={(path) => handleSchemaFilter("destination", path)}
      />

      <AddMappingDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        sourceSchema={template.sourceSchema}
        destinationSchema={template.destinationSchema}
        initialSourceField={addDraft.sourceField}
        initialSourceType={addDraft.sourceType}
        initialDestinationField={addDraft.destinationField}
        initialDestinationType={addDraft.destinationType}
        onSave={handleSaveNewMapping}
      />
    </div>
  );
}
