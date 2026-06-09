"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MappingStatusBadge } from "./mapping-status-badge";
import type { MappingRule, TransformRule, ValidationRule } from "@/types/mapping";
import { getTransformForRule, getValidationRulesForMapping } from "@/services/mapping-service";
import { ArrowRight, Copy, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MappingTableProps {
  rules: MappingRule[];
  validationRules: ValidationRule[];
  transformRules: TransformRule[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const PAGE_SIZE = 50;

export function MappingTable({
  rules,
  validationRules,
  transformRules,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: MappingTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rules.length / PAGE_SIZE));
  const pageRules = useMemo(
    () => rules.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [rules, page]
  );

  return (
    <div className="flex flex-col min-h-0 rounded-xl border border-border/60 bg-card/90 overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Source Field</TableHead>
              <TableHead className="w-8" />
              <TableHead className="text-xs">Destination Field</TableHead>
              <TableHead className="text-xs">Validation</TableHead>
              <TableHead className="text-xs">Transform</TableHead>
              <TableHead className="text-xs">Confidence</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRules.map((rule) => (
              <MappingRow
                key={rule.id}
                rule={rule}
                validationRules={validationRules}
                transformRules={transformRules}
                selected={selectedId === rule.id}
                onSelect={() => onSelect(rule.id)}
                onEdit={() => onEdit(rule.id)}
                onDelete={() => onDelete(rule.id)}
                onDuplicate={() => onDuplicate(rule.id)}
              />
            ))}
            {pageRules.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                  No mappings match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {rules.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
          <span>
            Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, rules.length)} of{" "}
            {rules.length} mappings
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MappingRow({
  rule,
  validationRules,
  transformRules,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  rule: MappingRule;
  validationRules: ValidationRule[];
  transformRules: TransformRule[];
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const validations = getValidationRulesForMapping(rule, validationRules);
  const transform = getTransformForRule(rule, transformRules);

  return (
    <TableRow
      className={cn("cursor-pointer", selected && "bg-primary/5")}
      onClick={onSelect}
      data-state={selected ? "selected" : undefined}
    >
      <TableCell className="font-mono text-xs max-w-[140px] truncate">{rule.sourceField}</TableCell>
      <TableCell>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </TableCell>
      <TableCell className="font-mono text-xs max-w-[140px] truncate">{rule.destinationField}</TableCell>
      <TableCell>
        {validations.length > 0 ? (
          <span className="text-xs text-muted-foreground">{validations.length} rules</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {transform ? (
          <span className="text-xs font-mono truncate max-w-[100px] inline-block">
            {transform.transformType === "Formula"
              ? String(transform.config.formula ?? transform.transformType)
              : transform.transformType}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-xs font-medium">{rule.confidence}%</TableCell>
      <TableCell>
        <MappingStatusBadge status={rule.status} />
      </TableCell>
      <TableCell>
        <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit} aria-label="Edit">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onDuplicate} aria-label="Duplicate">
            <Copy className="h-3 w-3" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={onDelete} aria-label="Delete">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
