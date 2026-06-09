import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Wizard progress" className="w-full overflow-x-auto pb-2">
      <ol className="flex min-w-max items-start gap-0">
        {steps.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <li key={label} className="flex items-start flex-1 min-w-[5.5rem] last:flex-none last:min-w-0">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-semibold transition-all shrink-0",
                    isComplete && "h-8 w-8 border-success bg-success text-white",
                    isCurrent && "h-10 w-10 border-primary bg-primary text-primary-foreground text-sm shadow-sm",
                    isFuture && "h-8 w-8 border-border bg-muted text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs text-center leading-tight max-w-[5.5rem]",
                    isCurrent && "font-semibold text-primary",
                    isComplete && "text-success-subtle-foreground",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mt-5 mx-1 min-w-[1.5rem]",
                    isComplete ? "bg-success" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
