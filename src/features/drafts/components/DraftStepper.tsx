import { Check } from "lucide-react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { cn } from "@/lib/utils";
import type { DraftStepConfig } from "./draftStepConfig";

interface DraftStepperProps {
  steps: DraftStepConfig[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}

export function DraftStepper({
  steps,
  currentStep,
  onStepChange,
}: DraftStepperProps) {
  return (
    <Stepper
      value={currentStep + 1}
      onValueChange={(value) => onStepChange(value - 1)}
      indicators={{
        completed: <Check className="size-3.5" aria-hidden="true" />,
      }}
      className="rounded-xl border bg-card/80 p-3 shadow-sm"
    >
      <StepperNav className="items-center gap-2">
        {steps.map((step, index) => {
          const stepValue = index + 1;
          const isFutureStep = index > currentStep;
          const isActiveStep = index === currentStep;
          const isComplete = index < currentStep;
          const Icon = step.icon;

          return (
            <StepperItem
              key={step.title}
              step={stepValue}
              disabled={isFutureStep}
              className={cn(
                "items-center justify-start transition-[flex] duration-300",
                isActiveStep ? "flex-[1.8]" : "flex-none",
              )}
            >
              <StepperTrigger
                type="button"
                className={cn(
                  "min-w-0 rounded-full border bg-background/80 transition-all duration-300",
                  "hover:border-primary/35 hover:bg-primary/5",
                  isActiveStep
                    ? "h-12 w-full justify-start gap-2.5 px-2.5 pr-4 shadow-[0_14px_36px_-28px_var(--primary)] ring-1 ring-primary/20"
                    : "size-12 justify-center p-0",
                  isActiveStep &&
                    "border-primary bg-primary/10",
                  isComplete && "border-primary/30 bg-primary/5",
                  isFutureStep &&
                    "cursor-not-allowed opacity-70 hover:border-border hover:bg-background/80",
                )}
              >
                <StepperIndicator
                  className={cn(
                    "size-8 border text-sm font-bold shadow-sm transition-all duration-300",
                    "data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground",
                    "data-[state=active]:scale-105 data-[state=completed]:bg-primary/15 data-[state=completed]:text-primary",
                  )}
                >
                  {isActiveStep ? (
                    <Icon className="size-4" aria-hidden="true" />
                  ) : (
                    stepValue
                  )}
                </StepperIndicator>

                {isActiveStep && (
                  <StepperTitle className="min-w-0 truncate text-sm font-bold md:text-[0.95rem]">
                    {step.title}
                  </StepperTitle>
                )}
              </StepperTrigger>
              {index < steps.length - 1 && (
                <StepperSeparator className="mx-1 h-0.5 min-w-5 flex-1 self-center data-[state=completed]:bg-primary/70" />
              )}
            </StepperItem>
          );
        })}
      </StepperNav>
    </Stepper>
  );
}
