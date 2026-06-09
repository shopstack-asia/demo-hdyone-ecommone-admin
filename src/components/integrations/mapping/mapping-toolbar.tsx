import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MappingFilter } from "@/types/mapping";
import { ArrowLeftRight, Filter, ListTree, Plus, Wand2 } from "lucide-react";

interface MappingToolbarProps {
  filter: MappingFilter;
  onFilterChange: (filter: MappingFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onAddMapping: () => void;
  onAutoMap: () => void;
  onBrowseSourceFields: () => void;
  onBrowseDestinationFields: () => void;
  activeFieldFilter?: string;
  onClearFieldFilter?: () => void;
}

const FILTER_OPTIONS: { value: MappingFilter; label: string }[] = [
  { value: "ALL", label: "All mappings" },
  { value: "NEED_REVIEW", label: "Need Review" },
  { value: "UNMAPPED", label: "Unmapped" },
  { value: "MAPPED", label: "Mapped" },
];

export function MappingToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onAddMapping,
  onAutoMap,
  onBrowseSourceFields,
  onBrowseDestinationFields,
  activeFieldFilter,
  onClearFieldFilter,
}: MappingToolbarProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <Button type="button" size="sm" onClick={onAddMapping} className="gap-1.5 shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add mapping
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onAutoMap} className="gap-1.5 shrink-0">
          <Wand2 className="h-3.5 w-3.5" />
          Auto map
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBrowseSourceFields}
          className="gap-1.5 shrink-0"
        >
          <ListTree className="h-3.5 w-3.5" />
          Browse source fields
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBrowseDestinationFields}
          className="gap-1.5 shrink-0"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Browse destination fields
        </Button>
        <Select value={filter} onValueChange={(v) => onFilterChange(v as MappingFilter)}>
          <SelectTrigger className="h-8 w-full sm:w-[160px] text-xs">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search mapping..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 text-xs flex-1 min-w-[140px]"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0" aria-label="Filter">
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </div>
      {activeFieldFilter && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filtered by field:</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{activeFieldFilter}</code>
          {onClearFieldFilter && (
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearFieldFilter}>
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
