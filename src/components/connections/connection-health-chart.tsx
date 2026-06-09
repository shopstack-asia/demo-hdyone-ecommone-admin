interface ConnectionHealthChartProps {
  successRate: number;
  responseTimeMs: number;
}

function getSuccessColor(successRate: number): string {
  if (successRate >= 95) return "var(--chart-success)";
  if (successRate >= 80) return "var(--chart-retry)";
  return "var(--chart-failed)";
}

export function ConnectionHealthChart({ successRate, responseTimeMs }: ConnectionHealthChartProps) {
  const size = 88;
  const radius = size / 2;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const clampedRate = Math.min(100, Math.max(0, successRate));
  const successOffset = circumference - (clampedRate / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`Success rate ${clampedRate.toFixed(1)} percent, response time ${responseTimeMs} milliseconds`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
            opacity={0.4}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={getSuccessColor(clampedRate)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={successOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center px-2">
          <span className="text-lg font-semibold leading-none">{clampedRate.toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Response time</p>
        <p className="text-sm font-medium">{responseTimeMs}ms</p>
      </div>
    </div>
  );
}
