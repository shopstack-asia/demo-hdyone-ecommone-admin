import type { MappingSummary } from "@/types/mapping";

interface MappingSummaryCardsProps {
  summary: MappingSummary;
}

export function MappingSummaryCards({ summary }: MappingSummaryCardsProps) {
  const cards = [
    { label: "Mapped", value: summary.mapped, color: "text-success-subtle-foreground" },
    { label: "Need Review", value: summary.needReview, color: "text-warning-subtle-foreground" },
    { label: "Unmapped", value: summary.unmapped, color: "text-destructive-subtle-foreground" },
    {
      label: "Auto Mapped",
      value: `${summary.autoMapped} / ${summary.total}`,
      color: "text-info-subtle-foreground",
    },
    { label: "Confidence", value: `${summary.confidence}%`, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border/60 bg-card/80 px-3 py-2.5 text-center"
        >
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{card.label}</p>
          <p className={`text-lg font-semibold mt-0.5 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
