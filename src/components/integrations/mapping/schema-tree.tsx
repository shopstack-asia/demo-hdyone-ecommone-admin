"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFieldSampleValue } from "@/lib/mapping/schema-utils";
import type { SchemaField } from "@/types/mapping";
import { ChevronDown, ChevronRight, Hash, Calendar, Type, Braces, Filter, Plus } from "lucide-react";

interface SchemaTreeProps {
  schema: SchemaField[];
  searchPlaceholder: string;
  selectedField?: string;
  onFieldSelect?: (fieldPath: string, fieldType: string) => void;
  variant: "source" | "destination";
  showFieldActions?: boolean;
  onAddMapping?: (fieldPath: string, fieldType: string) => void;
  onFilterTable?: (fieldPath: string) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  string: <Type className="h-3 w-3" />,
  number: <Hash className="h-3 w-3" />,
  decimal: <Hash className="h-3 w-3" />,
  datetime: <Calendar className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  object: <Braces className="h-3 w-3" />,
  array: <Braces className="h-3 w-3" />,
};

export function SchemaTree({
  schema,
  searchPlaceholder,
  selectedField,
  onFieldSelect,
  variant,
  showFieldActions = false,
  onAddMapping,
  onFilterTable,
}: SchemaTreeProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(schema.map((n) => [n.name, true]))
  );
  const [activeField, setActiveField] = useState<{ path: string; type: string } | undefined>();

  const filtered = useMemo(() => filterSchema(schema, search.toLowerCase()), [schema, search]);
  const displayField = activeField?.path ?? selectedField;
  const displayType = activeField?.type;

  const handleFieldClick = (path: string, type: string) => {
    setActiveField({ path, type });
    onFieldSelect?.(path, type);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-3">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto text-sm min-h-0">
        {filtered.map((node) => (
          <SchemaNode
            key={node.name}
            node={node}
            path={node.name}
            expanded={expanded[node.name] ?? true}
            onToggle={() => setExpanded((e) => ({ ...e, [node.name]: !e[node.name] }))}
            selectedField={displayField}
            onFieldClick={handleFieldClick}
            variant={variant}
          />
        ))}
      </div>

      {showFieldActions && displayField && displayType && (
        <div className="shrink-0 mt-3 pt-3 border-t border-border/60 space-y-3">
          <div className="rounded-lg bg-muted/40 p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected field</p>
            <p className="font-mono text-sm font-medium">{displayField}</p>
            <p className="text-xs text-muted-foreground">Type: {displayType}</p>
            {variant === "source" && (
              <p className="text-xs text-muted-foreground">
                Sample:{" "}
                <span className="font-mono">{getFieldSampleValue(displayField, displayType)}</span>
              </p>
            )}
            {variant === "destination" && (
              <p className="text-xs text-muted-foreground">Required fields are marked with *</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onAddMapping?.(displayField, displayType)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add mapping
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onFilterTable?.(displayField)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter mapping table
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaNode({
  node,
  path,
  expanded,
  onToggle,
  selectedField,
  onFieldClick,
  variant,
}: {
  node: SchemaField;
  path: string;
  expanded: boolean;
  onToggle: () => void;
  selectedField?: string;
  onFieldClick: (path: string, type: string) => void;
  variant: "source" | "destination";
}) {
  const hasChildren = node.children && node.children.length > 0;
  const childCount = node.children?.length ?? 0;

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-2 hover:bg-muted/60 font-medium text-left"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span>{node.name}</span>
          <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">
            {childCount}
          </span>
        </button>
        {expanded &&
          node.children!.map((child) => {
            const childPath = `${path}.${child.name}`;
            return (
              <SchemaLeaf
                key={childPath}
                field={child}
                path={childPath}
                selected={selectedField === childPath}
                onClick={() => onFieldClick(childPath, child.type)}
                variant={variant}
                indent
              />
            );
          })}
      </div>
    );
  }

  return (
    <SchemaLeaf
      field={node}
      path={path}
      selected={selectedField === path}
      onClick={() => onFieldClick(path, node.type)}
      variant={variant}
    />
  );
}

function SchemaLeaf({
  field,
  path,
  selected,
  onClick,
  variant,
  indent,
}: {
  field: SchemaField;
  path: string;
  selected: boolean;
  onClick: () => void;
  variant: "source" | "destination";
  indent?: boolean;
}) {
  const icon = TYPE_ICONS[field.type] ?? TYPE_ICONS.string;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/60",
        indent && "ml-5",
        selected && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-mono truncate">{field.name}</span>
      <span className="text-[10px] text-muted-foreground shrink-0">{field.type}</span>
      {variant === "destination" && field.required && (
        <span className="text-[10px] text-destructive shrink-0">*</span>
      )}
      {field.mapped != null && (
        <span
          className={cn(
            "ml-auto h-1.5 w-1.5 rounded-full shrink-0",
            field.mapped ? "bg-success-subtle-foreground" : "bg-muted-foreground/40"
          )}
          title={field.mapped ? "Mapped" : "Unmapped"}
        />
      )}
    </button>
  );
}

function filterSchema(nodes: SchemaField[], query: string): SchemaField[] {
  if (!query) return nodes;
  return nodes
    .map((node) => {
      if (node.children) {
        const children = node.children.filter(
          (c) => c.name.toLowerCase().includes(query) || node.name.toLowerCase().includes(query)
        );
        if (children.length > 0 || node.name.toLowerCase().includes(query)) {
          return { ...node, children: children.length ? children : node.children };
        }
        return null;
      }
      return node.name.toLowerCase().includes(query) ? node : null;
    })
    .filter(Boolean) as SchemaField[];
}
