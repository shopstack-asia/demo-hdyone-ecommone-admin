"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { flattenSchemaFields } from "@/lib/mapping/schema-utils";
import type { MappingRule, SchemaField } from "@/types/mapping";
import { Check, ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddMappingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceSchema: SchemaField[];
  destinationSchema: SchemaField[];
  initialSourceField?: string;
  initialSourceType?: string;
  initialDestinationField?: string;
  initialDestinationType?: string;
  onSave: (rule: Omit<MappingRule, "id">) => void;
}

export function AddMappingDrawer({
  open,
  onOpenChange,
  sourceSchema,
  destinationSchema,
  initialSourceField,
  initialSourceType,
  initialDestinationField,
  initialDestinationType,
  onSave,
}: AddMappingDrawerProps) {
  const [step, setStep] = useState(1);
  const [sourceSearch, setSourceSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [sourceField, setSourceField] = useState("");
  const [sourceType, setSourceType] = useState("string");
  const [destinationField, setDestinationField] = useState("");
  const [destinationType, setDestinationType] = useState("string");

  const sourceFields = useMemo(() => flattenSchemaFields(sourceSchema), [sourceSchema]);
  const destFields = useMemo(() => flattenSchemaFields(destinationSchema), [destinationSchema]);

  const filteredSource = useMemo(
    () =>
      sourceFields.filter(
        (f) =>
          f.path.toLowerCase().includes(sourceSearch.toLowerCase()) ||
          f.type.toLowerCase().includes(sourceSearch.toLowerCase())
      ),
    [sourceFields, sourceSearch]
  );

  const filteredDest = useMemo(
    () =>
      destFields.filter(
        (f) =>
          f.path.toLowerCase().includes(destSearch.toLowerCase()) ||
          f.type.toLowerCase().includes(destSearch.toLowerCase())
      ),
    [destFields, destSearch]
  );

  useEffect(() => {
    if (!open) return;
    setStep(initialSourceField ? 2 : 1);
    setSourceField(initialSourceField ?? "");
    setSourceType(initialSourceType ?? "string");
    setDestinationField(initialDestinationField ?? "");
    setDestinationType(initialDestinationType ?? "string");
    setSourceSearch("");
    setDestSearch("");
  }, [
    open,
    initialSourceField,
    initialSourceType,
    initialDestinationField,
    initialDestinationType,
  ]);

  const handleSave = () => {
    if (!sourceField || !destinationField) return;
    onSave({
      sourceField,
      sourceType,
      destinationField,
      destinationType,
      mappingType: "DIRECT",
      confidence: 70,
      status: "NEED_REVIEW",
      validationRuleIds: [],
      sampleInput: sourceFields.find((f) => f.path === sourceField)?.sampleValue,
    });
    onOpenChange(false);
  };

  const canProceedStep1 = Boolean(sourceField);
  const canSave = Boolean(sourceField && destinationField);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60 shrink-0">
          <SheetTitle>Add mapping</SheetTitle>
          <SheetDescription>
            Step {step} of 2 — {step === 1 ? "Select source field" : "Select destination field"}
          </SheetDescription>
          <StepIndicator current={step} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {step === 1 && (
            <FieldPicker
              label="Source field"
              search={sourceSearch}
              onSearchChange={setSourceSearch}
              fields={filteredSource}
              selectedPath={sourceField}
              onSelect={(f) => {
                setSourceField(f.path);
                setSourceType(f.type);
              }}
            />
          )}

          {step === 2 && (
            <>
              <SelectedFieldSummary label="Source" path={sourceField} type={sourceType} />
              <FieldPicker
                label="Destination field"
                search={destSearch}
                onSearchChange={setDestSearch}
                fields={filteredDest}
                selectedPath={destinationField}
                onSelect={(f) => {
                  setDestinationField(f.path);
                  setDestinationType(f.type);
                }}
                showRequired
              />
            </>
          )}
        </div>

        <SheetFooter className="px-5 py-4 border-t border-border/60 shrink-0 flex-row justify-between sm:justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1.5">
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step === 1 ? (
            <Button type="button" size="sm" disabled={!canProceedStep1} onClick={() => setStep(2)}>
              Next
            </Button>
          ) : (
            <Button type="button" size="sm" disabled={!canSave} onClick={handleSave} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Save mapping
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex gap-2 pt-2">
      {[1, 2].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            n <= current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

function SelectedFieldSummary({ label, path, type }: { label: string; path: string; type: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-mono font-medium">{path}</span>
      <span className="text-muted-foreground ml-2">({type})</span>
    </div>
  );
}

function FieldPicker({
  label,
  search,
  onSearchChange,
  fields,
  selectedPath,
  onSelect,
  showRequired,
}: {
  label: string;
  search: string;
  onSearchChange: (v: string) => void;
  fields: ReturnType<typeof flattenSchemaFields>;
  selectedPath: string;
  onSelect: (field: ReturnType<typeof flattenSchemaFields>[number]) => void;
  showRequired?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={`Search ${label.toLowerCase()}...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9"
        />
      </div>
      <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
        {fields.map((field) => (
          <button
            key={field.path}
            type="button"
            onClick={() => onSelect(field)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50",
              selectedPath === field.path && "bg-primary/10"
            )}
          >
            <span className="font-mono truncate flex-1">{field.path}</span>
            <span className="text-xs text-muted-foreground shrink-0">{field.type}</span>
            {showRequired && field.required && (
              <span className="text-xs text-destructive shrink-0">*</span>
            )}
          </button>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No fields match your search.</p>
        )}
      </div>
    </div>
  );
}
