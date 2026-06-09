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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TransformRule } from "@/types/mapping";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformRulesTabProps {
  rules: TransformRule[];
}

export function TransformRulesTab({ rules }: TransformRulesTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rules.find((r) => r.id === selectedId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 min-h-[420px]">
      <div className="rounded-xl border border-border/60 bg-card/90 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border/60">
          <h3 className="text-sm font-semibold">Transformation Rules</h3>
          <Button type="button" size="sm" variant="outline" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" />
            Add Transform
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Source Field</TableHead>
              <TableHead className="text-xs">Destination Field</TableHead>
              <TableHead className="text-xs">Transform Type</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Preview</TableHead>
              <TableHead className="text-xs w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow
                key={rule.id}
                className={cn("cursor-pointer", selectedId === rule.id && "bg-primary/5")}
                onClick={() => setSelectedId(rule.id)}
              >
                <TableCell className="font-mono text-xs">{rule.sourceField}</TableCell>
                <TableCell className="font-mono text-xs">{rule.destinationField}</TableCell>
                <TableCell className="text-xs">{rule.transformType}</TableCell>
                <TableCell className="text-xs max-w-[180px] truncate">{rule.description}</TableCell>
                <TableCell className="font-mono text-xs">
                  {rule.sampleOutput != null ? String(rule.sampleOutput) : "—"}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <TransformDetailPanel rule={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function TransformDetailPanel({ rule, onClose }: { rule: TransformRule; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold">Transform Detail</h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {rule.sourceField} → {rule.destinationField}
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto text-sm">
        <div className="space-y-1">
          <Label className="text-xs">Transform Type</Label>
          <Input className="h-8 text-xs" defaultValue={rule.transformType} readOnly />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Input className="h-8 text-xs" defaultValue={rule.description} readOnly />
        </div>
        {Object.entries(rule.config).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
            <Input className="h-8 text-xs font-mono" defaultValue={String(value)} readOnly />
          </div>
        ))}
        {(rule.sampleInput != null || rule.sampleOutput != null) && (
          <div className="rounded-lg border border-border/60 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Preview</p>
            {rule.sampleInput != null && (
              <p className="text-xs">
                <span className="text-muted-foreground">Input: </span>
                <span className="font-mono">{String(rule.sampleInput)}</span>
              </p>
            )}
            {rule.sampleOutput != null && (
              <p className="text-xs">
                <span className="text-muted-foreground">Output: </span>
                <span className="font-mono">{String(rule.sampleOutput)}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border/60 flex gap-2">
        <Button type="button" size="sm">
          Save
        </Button>
        <Button type="button" size="sm" variant="outline">
          Reset
        </Button>
        <Button type="button" size="sm" variant="outline" className="text-destructive ml-auto">
          Remove
        </Button>
      </div>
    </div>
  );
}
