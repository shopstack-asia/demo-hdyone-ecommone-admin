import { ProviderCategory } from "@/types/enums";
import { cn } from "@/lib/utils";

export const PROVIDER_CATEGORY_STYLES: Record<
  ProviderCategory,
  { accent: string; badge: string; cardHover: string; logoBg: string }
> = {
  MARKETPLACE: {
    accent: "before:bg-warning",
    badge: "bg-warning-subtle text-warning-subtle-foreground",
    cardHover: "hover:bg-warning-subtle/25 hover:border-warning/30",
    logoBg: "bg-warning-subtle/60",
  },
  ERP: {
    accent: "before:bg-info",
    badge: "bg-info-subtle text-info-subtle-foreground",
    cardHover: "hover:bg-info-subtle/30 hover:border-info/30",
    logoBg: "bg-info-subtle/60",
  },
  STORAGE: {
    accent: "before:bg-chart-2",
    badge: "bg-secondary text-secondary-foreground",
    cardHover: "hover:bg-secondary/80 hover:border-chart-2/30",
    logoBg: "bg-secondary/80",
  },
  PROTOCOL: {
    accent: "before:bg-chart-3",
    badge: "bg-accent text-accent-foreground",
    cardHover: "hover:bg-accent/60 hover:border-chart-3/30",
    logoBg: "bg-accent/70",
  },
  CRM: {
    accent: "before:bg-primary",
    badge: "bg-primary-subtle text-primary-subtle-foreground",
    cardHover: "hover:bg-primary-subtle/40 hover:border-primary/25",
    logoBg: "bg-primary-subtle/50",
  },
  WMS: {
    accent: "before:bg-success",
    badge: "bg-success-subtle text-success-subtle-foreground",
    cardHover: "hover:bg-success-subtle/30 hover:border-success/30",
    logoBg: "bg-success-subtle/50",
  },
  CUSTOM: {
    accent: "before:bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
    cardHover: "hover:bg-muted/80 hover:border-border",
    logoBg: "bg-muted/70",
  },
};

export function getProviderCategoryStyles(category: ProviderCategory) {
  return PROVIDER_CATEGORY_STYLES[category] ?? PROVIDER_CATEGORY_STYLES.CUSTOM;
}

export function providerCardClassName(selected: boolean, category: ProviderCategory) {
  const styles = getProviderCategoryStyles(category);

  return cn(
    "group relative overflow-hidden rounded-xl border text-left transition-all duration-200",
    "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-full before:opacity-0 before:transition-opacity",
    styles.accent,
    selected
      ? "border-primary/40 bg-primary-subtle/40 shadow-md ring-2 ring-primary/15 before:opacity-100"
      : cn(
          "border-border/70 bg-card/90 shadow-sm backdrop-blur-sm",
          styles.cardHover,
          "hover:shadow-md hover:before:opacity-70"
        )
  );
}

export const wizardPanelClassName =
  "rounded-2xl border border-border/60 bg-gradient-to-br from-muted/60 via-card to-secondary/40 p-5 sm:p-7 shadow-sm ring-1 ring-border/30";
