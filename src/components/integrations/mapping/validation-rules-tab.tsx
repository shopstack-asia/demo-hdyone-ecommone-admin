"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupValidationRulesByField } from "@/services/mapping-service";
import type { ValidationRule } from "@/types/mapping";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationRulesTabProps {
  rules: ValidationRule[];
}

export function ValidationRulesTab({ rules }: ValidationRulesTabProps) {
  const grouped = groupValidationRulesByField(rules);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const selected = grouped.find((g) => g.field === selectedField);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 min-h-[420px]">
      <div className="rounded-xl border border-border/60 bg-card/90 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border/60">
          <h3 className="text-sm font-semibold">Validation Rules by Field</h3>
          <Button type="button" size="sm" variant="outline" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Field</TableHead>
              <TableHead className="text-xs">Rules</TableHead>
              <TableHead className="text-xs">Severity</TableHead>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map((group) => {
              const maxSeverity = group.rules.some((r) => r.severity === "ERROR")
                ? "ERROR"
                : group.rules.some((r) => r.severity === "WARNING")
                  ? "WARNING"
                  : "INFO";
              const source = group.rules[0]?.source ?? "TEMPLATE";
              return (
                <TableRow
                  key={group.field}
                  className={cn("cursor-pointer", selectedField === group.field && "bg-primary/5")}
                  onClick={() => setSelectedField(group.field)}
                >
                  <TableCell className="font-mono text-xs">{group.field}</TableCell>
                  <TableCell className="text-xs">
                    {group.rules.map((r) => r.ruleType).join(", ")}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={maxSeverity} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Edit">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" aria-label="Remove">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <ValidationDetailPanel
          field={selected.field}
          rules={selected.rules}
          onClose={() => setSelectedField(null)}
        />
      )}
    </div>
  );
}

function ValidationDetailPanel({
  field,
  rules,
  onClose,
}: {
  field: string;
  rules: ValidationRule[];
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold">Validation Detail</h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">{field}</p>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-lg border border-border/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{rule.ruleType}</span>
              <SeverityBadge severity={rule.severity} />
            </div>
            <p className="text-xs text-muted-foreground">{rule.message}</p>
            <Badge variant="outline" className="text-xs">
              {rule.source}
            </Badge>
          </div>
        ))}
        <div className="space-y-2 pt-2">
          <Label className="text-xs">Add validation rule</Label>
          <Select>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select rule type" />
            </SelectTrigger>
            <SelectContent>
              {["Required", "Valid Date", "Email Format", "Max Length", "Min Value", "Is Number"].map(
                (t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-4 border-t border-border/60 flex gap-2">
        <Button type="button" size="sm">
          Save
        </Button>
        <Button type="button" size="sm" variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles =
    severity === "ERROR"
      ? "bg-destructive-subtle text-destructive-subtle-foreground"
      : severity === "WARNING"
        ? "bg-warning-subtle text-warning-subtle-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <Badge className={cn("text-xs border-transparent", styles)}>{severity}</Badge>
  );
}
