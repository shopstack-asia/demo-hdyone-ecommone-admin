import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cable, Plus } from "lucide-react";

interface ConnectionsEmptyStateProps {
  createHref: string;
}

export function ConnectionsEmptyState({ createHref }: ConnectionsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Cable className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-sm font-semibold mb-1">No connections yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Configure provider credentials before creating integration flows.
      </p>
      <Link href={createHref} className={cn(buttonVariants(), "min-h-11 inline-flex")}>
        <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
        Create connection
      </Link>
    </div>
  );
}
