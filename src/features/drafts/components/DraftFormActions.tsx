import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraftFormActionsProps {
  currentStep: number;
  stepsCount: number;
  isPending?: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function DraftFormActions({
  currentStep,
  stepsCount,
  isPending,
  onBack,
  onNext,
}: DraftFormActionsProps) {
  const isLastStep = currentStep === stepsCount - 1;

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={currentStep === 0 || isPending}
        onClick={(event) => {
          event.preventDefault();
          onBack();
        }}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {isLastStep ? (
        <Button type="submit" isLoading={isPending}>
          <Rocket className="size-4" />
          Start workshop
        </Button>
      ) : (
        <Button
          type="button"
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault();
            onNext();
          }}
        >
          Continue
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
