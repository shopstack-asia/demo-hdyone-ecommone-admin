"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_SERIES, getStatusChartColor } from "@/lib/chart-colors";
import type { ProviderUsageDataPoint, StatusDistributionDataPoint, TrendDataPoint } from "@/types/domain";

interface ChartCardProps {
  title: string;
  titleId: string;
  ariaLabel: string;
  children: React.ReactNode;
  height?: number;
}

function ChartCard({ title, titleId, ariaLabel, children, height = 220 }: ChartCardProps) {
  return (
    <section aria-labelledby={titleId}>
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle id={titleId} className="text-base font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={ariaLabel}>
            <ResponsiveContainer width="100%" height={height}>
              {children}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface ExecutionTrendChartProps {
  data: TrendDataPoint[];
}

export function ExecutionTrendChart({ data }: ExecutionTrendChartProps) {
  return (
    <ChartCard
      title="Execution trend"
      titleId="chart-execution-trend"
      ariaLabel="Stacked area chart of execution outcomes over time: success, failed, retry, and DLQ"
      height={280}
    >
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="success" stackId="1" stroke={CHART_SERIES.success} fill={CHART_SERIES.success} fillOpacity={0.3} name="Success" />
        <Area type="monotone" dataKey="failed" stackId="1" stroke={CHART_SERIES.failed} fill={CHART_SERIES.failed} fillOpacity={0.3} name="Failed" />
        <Area type="monotone" dataKey="retry" stackId="1" stroke={CHART_SERIES.retry} fill={CHART_SERIES.retry} fillOpacity={0.3} name="Retry" />
        <Area type="monotone" dataKey="dlq" stackId="1" stroke={CHART_SERIES.dlq} fill={CHART_SERIES.dlq} fillOpacity={0.3} name="DLQ" />
      </AreaChart>
    </ChartCard>
  );
}

interface FailureTrendChartProps {
  data: TrendDataPoint[];
}

export function FailureTrendChart({ data }: FailureTrendChartProps) {
  return (
    <ChartCard
      title="Failure trend"
      titleId="chart-failure-trend"
      ariaLabel="Bar chart of failed executions over time"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="failed" fill={CHART_SERIES.failed} name="Failed" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

interface DlqTrendChartProps {
  data: TrendDataPoint[];
}

export function DlqTrendChart({ data }: DlqTrendChartProps) {
  return (
    <ChartCard
      title="DLQ trend"
      titleId="chart-dlq-trend"
      ariaLabel="Bar chart of dead letter queue records over time"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="dlq" fill={CHART_SERIES.dlq} name="DLQ records" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

interface ProviderUsageChartProps {
  data: ProviderUsageDataPoint[];
}

export function ProviderUsageChart({ data }: ProviderUsageChartProps) {
  return (
    <ChartCard
      title="Provider usage"
      titleId="chart-provider-usage"
      ariaLabel="Horizontal bar chart of connection count by provider"
    >
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="provider" type="category" tick={{ fontSize: 11 }} width={80} />
        <Tooltip />
        <Bar dataKey="count" fill={CHART_SERIES.primary} name="Connections" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ChartCard>
  );
}

interface StatusDistributionChartProps {
  data: StatusDistributionDataPoint[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <ChartCard
      title="Execution status distribution"
      titleId="chart-status-distribution"
      ariaLabel="Donut chart showing execution counts grouped by status"
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill ?? getStatusChartColor(entry.status)} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartCard>
  );
}
