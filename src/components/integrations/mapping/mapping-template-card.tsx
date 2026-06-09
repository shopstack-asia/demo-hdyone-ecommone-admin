interface MappingTemplateCardProps {
  templateCode: string;
  confidence: number;
}

export function MappingTemplateCard({ templateCode, confidence }: MappingTemplateCardProps) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary-subtle/15 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Suggested Mapping Template
      </p>
      <p className="font-mono font-semibold mt-1">{templateCode}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Confidence{" "}
        <span className="font-semibold text-success-subtle-foreground">{confidence}%</span>
        <span className="ml-2 text-xs text-primary">· Template applied</span>
      </p>
    </div>
  );
}
