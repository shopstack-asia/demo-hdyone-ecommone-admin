"use client";

import { cn } from "@/lib/utils";

interface SetupSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SetupSection({ title, description, children, className }: SetupSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function FormGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] [&>*]:min-w-0",
        className
      )}
    >
      {children}
    </div>
  );
}
