"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hide this field in the mobile card layout */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Stable row key for list reconciliation */
  getRowId?: (row: T, index: number) => string;
  /** When set, the row (and mobile card) navigates via link */
  rowHref?: (row: T) => string | undefined;
  /** @deprecated Prefer rowHref for keyboard-accessible navigation */
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  caption?: string;
}

function defaultRowId<T>(_row: T, index: number) {
  return String(index);
}

function getMobileColumns<T>(columns: Column<T>[], rowHref?: (row: T) => string | undefined) {
  return columns.filter(
    (col) => !col.hideOnMobile && !(rowHref && col.key === "actions")
  );
}

export function DataTable<T>({
  columns,
  data,
  getRowId = defaultRowId,
  rowHref,
  onRowClick,
  emptyMessage = "No records found.",
  className,
  caption,
}: DataTableProps<T>) {
  const mobileColumns = getMobileColumns(columns, rowHref);
  const tableMinWidth = Math.max(640, columns.length * 112);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-border/60 px-4 py-10 text-center text-sm text-muted-foreground",
          className
        )}
        role="status"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3" role="list" aria-label={caption ?? "Records"}>
        {data.map((row, index) => {
          const id = getRowId(row, index);
          const href = rowHref?.(row);
          const card = (
            <article
              className={cn(
                "rounded-lg border border-border/60 bg-card p-4 shadow-sm",
                href && "transition-colors hover:bg-muted/30 active:bg-muted/50"
              )}
            >
              <dl className="space-y-2">
                {mobileColumns.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-start justify-between gap-3 min-w-0"
                  >
                    <dt className="text-xs font-medium text-muted-foreground shrink-0 pt-0.5">
                      {col.header}
                    </dt>
                    <dd className="text-sm text-right min-w-0 break-words [&_button]:min-h-11 [&_button]:px-3">
                      {col.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );

          if (href) {
            return (
              <Link key={id} href={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" role="listitem">
                {card}
              </Link>
            );
          }

          return (
            <div key={id} role="listitem">
              {card}
            </div>
          );
        })}
      </div>

      {/* Desktop: scrollable table */}
      <div className="hidden md:block">
        <p className="sr-only">
          Table with horizontal scroll. Use arrow keys after focusing the table region.
        </p>
        {columns.length > 6 && (
          <p className="text-xs text-muted-foreground mb-2" aria-hidden="true">
            Scroll horizontally to see all columns
          </p>
        )}
        <div
          className="rounded-md border border-border/60 overflow-x-auto overscroll-x-contain"
          tabIndex={0}
          role="region"
          aria-label={caption ?? "Data table"}
        >
          <Table style={{ minWidth: tableMinWidth }}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const id = getRowId(row, index);
                const href = rowHref?.(row);
                const isInteractive = Boolean(href || onRowClick);

                const cells = columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.className,
                      "max-w-[280px] min-w-0",
                      col.key === "actions" && "[&_button]:min-h-10 [&_button]:px-3"
                    )}
                  >
                    <div className="min-w-0 break-words whitespace-normal">
                      {col.cell(row)}
                    </div>
                  </TableCell>
                ));

                if (href) {
                  return (
                    <TableRow
                      key={id}
                      className="cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50"
                    >
                      {columns.map((col, colIndex) => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            col.className,
                            "max-w-[280px] min-w-0 p-0",
                            col.key === "actions" && "[&_button]:min-h-10 [&_button]:px-3"
                          )}
                        >
                          {colIndex === 0 ? (
                            <Link
                              href={href}
                              className="block min-h-10 px-2 py-2 min-w-0 break-words whitespace-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            >
                              {col.cell(row)}
                            </Link>
                          ) : (
                            <div className="px-2 py-2 min-w-0 break-words whitespace-normal">
                              {col.cell(row)}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                }

                return (
                  <TableRow
                    key={id}
                    className={isInteractive ? "cursor-pointer" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? "button" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {cells}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
