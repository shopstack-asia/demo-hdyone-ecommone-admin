/** CSS variable references for Recharts fill/stroke props (resolved from :root / .dark). */

export const CHART_SERIES = {
  success: "var(--chart-success)",
  failed: "var(--chart-failed)",
  retry: "var(--chart-retry)",
  dlq: "var(--chart-dlq)",
  primary: "var(--chart-primary)",
} as const;

export const STATUS_CHART_COLORS: Record<string, string> = {
  COMPLETED: CHART_SERIES.success,
  FAILED: CHART_SERIES.failed,
  RUNNING: CHART_SERIES.primary,
  QUEUED: "var(--chart-queued)",
  DLQ: CHART_SERIES.dlq,
};

export function getStatusChartColor(status: string): string {
  return STATUS_CHART_COLORS[status] ?? "var(--muted-foreground)";
}
