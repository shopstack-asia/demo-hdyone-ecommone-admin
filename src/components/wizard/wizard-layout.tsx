import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { WizardStepper } from "./wizard-stepper";

interface WizardLayoutProps {
  title: string;
  description?: string;
  steps: string[];
  currentStep: number;
  cancelHref: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  isSubmitStep?: boolean;
  onSubmit?: () => void;
  isPending?: boolean;
  isNextDisabled?: boolean;
  showNext?: boolean;
  onSaveDraft?: () => void;
  saveDraftLabel?: string;
  isSaveDraftPending?: boolean;
  footerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function WizardLayout({
  title,
  description,
  steps,
  currentStep,
  cancelHref,
  onBack,
  onNext,
  nextLabel = "Next",
  backLabel = "Back",
  submitLabel = "Save",
  isSubmitStep = false,
  onSubmit,
  isPending = false,
  isNextDisabled = false,
  showNext = true,
  onSaveDraft,
  saveDraftLabel = "Save as Draft",
  isSaveDraftPending = false,
  footerActions,
  children,
}: WizardLayoutProps) {
  const isFirstStep = currentStep === 0;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <WizardStepper steps={steps} currentStep={currentStep} />

      <div className="min-h-[20rem] rounded-2xl border border-border/60 bg-gradient-to-br from-muted/60 via-card to-secondary/40 p-5 sm:p-7 shadow-sm ring-1 ring-border/30">
        {children}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex justify-between gap-4 max-w-[1400px] mx-auto">
          {isFirstStep ? (
            <Link href={cancelHref}>
              <Button type="button" variant="outline" className="min-h-11">
                Cancel
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isPending || isSaveDraftPending}
              className="min-h-11"
            >
              {backLabel}
            </Button>
          )}

          {footerActions ?? (
            <div className="flex items-center gap-2">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isPending || isSaveDraftPending}
                  className="min-h-11"
                >
                  {isSaveDraftPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {saveDraftLabel}
                </Button>
              )}
              {isSubmitStep ? (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isPending || isSaveDraftPending}
                  className="min-h-11"
                >
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submitLabel}
                </Button>
              ) : showNext ? (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={isPending || isSaveDraftPending || isNextDisabled}
                  className="min-h-11"
                >
                  {nextLabel}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
