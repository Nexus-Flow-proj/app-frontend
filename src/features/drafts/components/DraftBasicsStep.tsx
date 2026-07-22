import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { FolderKanban } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateDraftFormValues } from "../validation";
import { DraftColorPicker } from "./DraftColorPicker";

interface DraftBasicsStepProps {
  register: UseFormRegister<CreateDraftFormValues>;
  setValue: UseFormSetValue<CreateDraftFormValues>;
  selectedColor: string;
  errors: FieldErrors<CreateDraftFormValues>;
  disabled?: boolean;
}

export function DraftBasicsStep({
  register,
  setValue,
  selectedColor,
  errors,
  disabled,
}: DraftBasicsStepProps) {
  return (
    <>
      <FormInput
        id="draft-name"
        label="Draft name"
        placeholder="Customer portal launch"
        autoComplete="off"
        disabled={disabled}
        leftIcon={<FolderKanban className="size-4" />}
        error={errors.name?.message}
        labelClassName="text-sm"
        inputClassName="h-11 text-sm font-semibold"
        {...register("name")}
        required
      />

      <div className="space-y-1.5">
        <Label
          htmlFor="draft-description"
          className="text-sm font-bold text-foreground"
        >
          Description<span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="draft-description"
          placeholder="What should this project accomplish?"
          disabled={disabled}
          aria-invalid={!!errors.description}
          className="min-h-32 resize-none bg-background text-sm font-semibold"
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <DraftColorPicker
        value={selectedColor}
        disabled={disabled}
        error={errors.color?.message}
        onChange={(color) =>
          setValue("color", color, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      />
      <input type="hidden" {...register("color")} />
    </>
  );
}
