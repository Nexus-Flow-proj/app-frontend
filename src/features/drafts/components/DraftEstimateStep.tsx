import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Clock3 } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import type { CreateDraftFormValues } from "../validation";

interface DraftEstimateStepProps {
  register: UseFormRegister<CreateDraftFormValues>;
  errors: FieldErrors<CreateDraftFormValues>;
  disabled?: boolean;
}

export function DraftEstimateStep({
  register,
  errors,
  disabled,
}: DraftEstimateStepProps) {
  return (
    <div className="w-full space-y-3">
      <FormInput
        id="draft-estimate"
        label="Estimated time in weeks"
        type="number"
        min={1}
        max={104}
        disabled={disabled}
        leftIcon={<Clock3 className="size-4" />}
        error={errors.estimatedTimeWeeks?.message}
        labelClassName="text-sm"
        inputClassName="h-12 text-sm font-semibold"
        {...register("estimatedTimeWeeks", { valueAsNumber: true })}
        required
      />
      <p className="text-sm leading-6 text-muted-foreground">
        Use a rough estimate. The workshop can still reshape the final plan.
      </p>
    </div>
  );
}
