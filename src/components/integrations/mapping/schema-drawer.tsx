"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SchemaTree } from "./schema-tree";
import type { SchemaField } from "@/types/mapping";

interface SchemaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: "left" | "right";
  title: string;
  description: string;
  schema: SchemaField[];
  searchPlaceholder: string;
  variant: "source" | "destination";
  onAddMapping: (fieldPath: string, fieldType: string) => void;
  onFilterTable: (fieldPath: string) => void;
}

export function SchemaDrawer({
  open,
  onOpenChange,
  side,
  title,
  description,
  schema,
  searchPlaceholder,
  variant,
  onAddMapping,
  onFilterTable,
}: SchemaDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60 shrink-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-5 py-4 flex flex-col min-h-0">
          <SchemaTree
            schema={schema}
            searchPlaceholder={searchPlaceholder}
            variant={variant}
            showFieldActions
            onAddMapping={(path, type) => {
              onAddMapping(path, type);
              onOpenChange(false);
            }}
            onFilterTable={(path) => {
              onFilterTable(path);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
