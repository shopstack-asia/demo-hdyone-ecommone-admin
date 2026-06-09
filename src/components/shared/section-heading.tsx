import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ id, children, className }: SectionHeadingProps) {
  return (
    <h2 id={id} className={cn("text-sm font-semibold mb-3", className)}>
      {children}
    </h2>
  );
}
