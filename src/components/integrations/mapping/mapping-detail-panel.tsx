"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MappingStatusBadge } from "./mapping-status-badge";
import { RuleChip } from "./rule-chip";
import type { MappingRule, TransformRule, ValidationRule } from "@/types/mapping";
import { getTransformForRule, getValidationRulesForMapping } from "@/services/mapping-service";
import { ArrowRight, X } from "lucide-react";

interface MappingDetailPanelProps {
  rule: MappingRule;
  validationRules: ValidationRule[];
  transformRules: TransformRule[];
  onClose: () => void;
  onSave: (patch: Partial<MappingRule>) => void;
  onReset: () => void;
  onDelete: () => void;
}

export function MappingDetailPanel({
  rule,
  validationRules,
  transformRules,
  onClose,
  onSave,
  onReset,
  onDelete,
}: MappingDetailPanelProps) {
  const validations = getValidationRulesForMapping(rule, validationRules);
  const transform = getTransformForRule(rule, transformRules);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-4 border-b border-border/60 shrink-0">
        <div>
          <h3 className="text-sm font-semibold">Mapping Detail</h3>
          <p className="text-xs font-mono mt-1 flex items-center gap-1.5">
            {rule.sourceField}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {rule.destinationField}
          </p>
          <div className="mt-2">
            <MappingStatusBadge status={rule.status} />
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        <DetailSection title="Source Field">
          <FieldRow label="Path" value={rule.sourceField} mono />
          <FieldRow label="Type" value={rule.sourceType} />
          {rule.sampleInput != null && (
            <FieldRow label="Sample" value={String(rule.sampleInput)} mono />
          )}
        </DetailSection>

        <DetailSection title="Destination Field">
          <FieldRow label="Path" value={rule.destinationField} mono />
          <FieldRow label="Type" value={rule.destinationType} />
        </DetailSection>

        <DetailSection title="Validation Rules">
          <div className="flex flex-wrap gap-1.5">
            {validations.map((v) => (
              <RuleChip key={v.id} label={v.ruleType} variant={v.severity === "ERROR" ? "success" : "warning"} />
            ))}
            {validations.length === 0 && (
              <p className="text-xs text-muted-foreground">No validation rules attached.</p>
            )}
          </div>
        </DetailSection>

        <TransformConfig transform={transform} onSave={onSave} />

        {(rule.sampleInput != null || rule.sampleOutput != null) && (
          <DetailSection title="Preview">
            {rule.sampleInput != null && (
              <FieldRow label="Input" value={String(rule.sampleInput)} mono />
            )}
            {rule.sampleOutput != null && (
              <FieldRow label="Output" value={String(rule.sampleOutput)} mono />
            )}
          </DetailSection>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Description</Label>
          <Textarea placeholder="Optional notes..." className="text-xs min-h-[60px]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 border-t border-border/60 shrink-0">
        <Button type="button" size="sm" onClick={() => onSave({ status: "MAPPED" })}>
          Save Rule
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button type="button" size="sm" variant="outline" className="text-destructive ml-auto" onClick={onDelete}>
          Delete Mapping
        </Button>
      </div>
    </div>
  );
}

function TransformConfig({
  transform,
  onSave,
}: {
  transform?: TransformRule;
  onSave: (patch: Partial<MappingRule>) => void;
}) {
  if (!transform) {
    return (
      <DetailSection title="Transform">
        <p className="text-xs text-muted-foreground">Pass source value to destination as-is.</p>
      </DetailSection>
    );
  }

  if (transform.transformType === "Date Format") {
    return (
      <DetailSection title="Transform — Date Format">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Output Format</Label>
            <Input
              className="h-8 text-xs font-mono"
              defaultValue={String(transform.config.outputFormat ?? "yyyy-MM-dd")}
              readOnly
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Timezone</Label>
            <Input
              className="h-8 text-xs"
              defaultValue={String(transform.config.timezone ?? "UTC")}
              readOnly
            />
          </div>
        </div>
      </DetailSection>
    );
  }

  if (transform.transformType === "Formula") {
    return (
      <DetailSection title="Transform — Formula">
        <div className="space-y-1">
          <Label className="text-xs">Formula expression</Label>
          <Input
            className="h-8 text-xs font-mono"
            defaultValue={String(transform?.config.formula ?? "")}
            onBlur={(e) => onSave({ status: "NEED_REVIEW" })}
          />
        </div>
      </DetailSection>
    );
  }

  if (transform.transformType === "Lookup") {
    return (
      <DetailSection title="Transform — Lookup">
        <FieldRow label="Lookup table" value={String(transform.config.lookupTable ?? "—")} mono />
        <FieldRow label="Source key" value={String(transform.config.sourceKey ?? "—")} mono />
      </DetailSection>
    );
  }

  if (transform) {
    return (
      <DetailSection title="Transform">
        <FieldRow label="Type" value={transform.transformType} />
        <FieldRow label="Description" value={transform.description} />
      </DetailSection>
    );
  }

  return null;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-xs py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={mono ? "font-mono text-right truncate" : "text-right truncate"}>{value}</span>
    </div>
  );
}
