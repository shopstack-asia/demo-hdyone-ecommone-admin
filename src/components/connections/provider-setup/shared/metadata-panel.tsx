"use client";

import { Folder, File, ChevronRight } from "lucide-react";
import type { DiscoveredMetadata, MetadataTreeItem } from "@/lib/provider-connection/types";
import { cn } from "@/lib/utils";

function TreeNode({ item, depth = 0 }: { item: MetadataTreeItem; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-1 text-sm">
        {item.type === "folder" || item.type === "prefix" ? (
          <Folder className="h-4 w-4 text-warning shrink-0" />
        ) : (
          <File className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="font-mono text-xs">{item.name}</span>
        {item.type === "prefix" && (
          <span className="text-[10px] text-muted-foreground uppercase">prefix</span>
        )}
      </div>
      {item.children?.map((child) => (
        <TreeNode key={child.name} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

interface MetadataPanelProps {
  metadata: DiscoveredMetadata;
  className?: string;
}

export function MetadataPanel({ metadata, className }: MetadataPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold">{metadata.title}</h3>
        {metadata.subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{metadata.subtitle}</p>
        )}
      </div>

      {metadata.sections.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-6 rounded-lg border border-border/60 bg-muted/30 text-sm">
          {metadata.sections.map((s) => (
            <div key={s.label}>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">{s.label}</dt>
              <dd className="font-medium mt-1 break-all">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {metadata.tree && metadata.tree.length > 0 && (
        <div className="p-4 rounded-lg border border-border/60 bg-card/80">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> Directory browser
          </p>
          {metadata.tree.map((item) => (
            <TreeNode key={item.name} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
