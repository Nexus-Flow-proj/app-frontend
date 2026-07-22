import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { FormInput } from "@/components/shared/FormInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_OPTION_VALUE,
  DRAFT_CATEGORY_OPTIONS,
  DESIGN_DELIVERABLE_OPTIONS,
  DESIGN_TOOL_OPTIONS,
  MARKETING_AUDIENCE_OPTIONS,
  MARKETING_CHANNEL_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  PROGRAMMING_TARGET_STACK_OPTIONS,
  ProjectCategory,
} from "../constants";
import type { CreateDraftFormValues } from "../validation";
import { DraftEstimateStep } from "./DraftEstimateStep";

interface DraftCategoryStepProps {
  register: UseFormRegister<CreateDraftFormValues>;
  setValue: UseFormSetValue<CreateDraftFormValues>;
  selectedCategory: ProjectCategory;
  targetStack: string;
  preferredLanguage: string;
  marketingChannels: string;
  targetAudience: string;
  designDeliverables: string;
  designTools: string;
  errors: FieldErrors<CreateDraftFormValues>;
  disabled?: boolean;
}

interface ConstraintSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function formatOptionLabel(value: string) {
  return value === CUSTOM_OPTION_VALUE ? "Custom value" : value;
}

function ConstraintSelect({
  label,
  value,
  options,
  placeholder,
  error,
  disabled,
  onChange,
}: ConstraintSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold text-foreground">
        {label}
        <span className="text-destructive">*</span>
      </Label>
      <Select value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger
          className="h-12 w-full bg-background text-sm font-semibold"
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function DraftCategoryStep({
  register,
  setValue,
  selectedCategory,
  targetStack,
  preferredLanguage,
  marketingChannels,
  targetAudience,
  designDeliverables,
  designTools,
  errors,
  disabled,
}: DraftCategoryStepProps) {
  return (
    <div className="space-y-5">
      <div className="w-full space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-foreground">
            Project Category<span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedCategory}
            disabled={disabled}
            onValueChange={(value: ProjectCategory) =>
              setValue("category", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              className="h-12 w-full bg-background text-sm font-semibold"
              aria-invalid={!!errors.category}
            >
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {DRAFT_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("category")} />
          {errors.category?.message && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {selectedCategory === ProjectCategory.PROGRAMMING && (
        <>
          <ConstraintSelect
            label="Target stack"
            value={targetStack}
            options={PROGRAMMING_TARGET_STACK_OPTIONS}
            placeholder="Choose target stack"
            error={errors.targetStack?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("targetStack", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("targetStack")} />
          {targetStack === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-target-stack"
              label="Custom target stack"
              placeholder="React, NestJS, PostgreSQL"
              autoComplete="off"
              disabled={disabled}
              error={errors.customTargetStack?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customTargetStack")}
              required
            />
          )}

          <ConstraintSelect
            label="Preferred language"
            value={preferredLanguage}
            options={PROGRAMMING_LANGUAGE_OPTIONS}
            placeholder="Choose preferred language"
            error={errors.preferredLanguage?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("preferredLanguage", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("preferredLanguage")} />
          {preferredLanguage === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-preferred-language"
              label="Custom preferred language"
              placeholder="Go, Ruby, Swift..."
              autoComplete="off"
              disabled={disabled}
              error={errors.customPreferredLanguage?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customPreferredLanguage")}
              required
            />
          )}
        </>
      )}

      {selectedCategory === ProjectCategory.MARKETING && (
        <>
          <ConstraintSelect
            label="Marketing channels"
            value={marketingChannels}
            options={MARKETING_CHANNEL_OPTIONS}
            placeholder="Choose marketing channels"
            error={errors.marketingChannels?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("marketingChannels", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("marketingChannels")} />
          {marketingChannels === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-marketing-channels"
              label="Custom marketing channels"
              placeholder="SEO, newsletter, TikTok"
              autoComplete="off"
              disabled={disabled}
              error={errors.customMarketingChannels?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customMarketingChannels")}
              required
            />
          )}

          <ConstraintSelect
            label="Target audience"
            value={targetAudience}
            options={MARKETING_AUDIENCE_OPTIONS}
            placeholder="Choose target audience"
            error={errors.targetAudience?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("targetAudience", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("targetAudience")} />
          {targetAudience === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-target-audience"
              label="Custom target audience"
              placeholder="Who are we trying to reach?"
              autoComplete="off"
              disabled={disabled}
              error={errors.customTargetAudience?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customTargetAudience")}
              required
            />
          )}
        </>
      )}

      {selectedCategory === ProjectCategory.DESIGN && (
        <>
          <ConstraintSelect
            label="Design deliverables"
            value={designDeliverables}
            options={DESIGN_DELIVERABLE_OPTIONS}
            placeholder="Choose design deliverables"
            error={errors.designDeliverables?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("designDeliverables", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("designDeliverables")} />
          {designDeliverables === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-design-deliverables"
              label="Custom design deliverables"
              placeholder="Moodboard, product page, icon set"
              autoComplete="off"
              disabled={disabled}
              error={errors.customDesignDeliverables?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customDesignDeliverables")}
              required
            />
          )}

          <ConstraintSelect
            label="Design tools"
            value={designTools}
            options={DESIGN_TOOL_OPTIONS}
            placeholder="Choose design tools"
            error={errors.designTools?.message}
            disabled={disabled}
            onChange={(value) =>
              setValue("designTools", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
          <input type="hidden" {...register("designTools")} />
          {designTools === CUSTOM_OPTION_VALUE && (
            <FormInput
              id="draft-custom-design-tools"
              label="Custom design tools"
              placeholder="Figma, Rive, Spline"
              autoComplete="off"
              disabled={disabled}
              error={errors.customDesignTools?.message}
              labelClassName="text-sm"
              inputClassName="h-12 text-sm font-semibold"
              {...register("customDesignTools")}
              required
            />
          )}
        </>
      )}

      {selectedCategory === ProjectCategory.GENERAL && (
        <>
          <FormInput
            id="draft-general-focus"
            label="Project focus"
            placeholder="Research, internal process, event planning..."
            autoComplete="off"
            disabled={disabled}
            error={errors.generalFocus?.message}
            labelClassName="text-sm"
            inputClassName="h-12 text-sm font-semibold"
            {...register("generalFocus")}
            required
          />

          <FormInput
            id="draft-general-context"
            label="Project context"
            placeholder="What should the plan pay attention to?"
            autoComplete="off"
            disabled={disabled}
            error={errors.generalContext?.message}
            labelClassName="text-sm"
            inputClassName="h-12 text-sm font-semibold"
            {...register("generalContext")}
            required
          />
        </>
      )}

      <DraftEstimateStep
        register={register}
        errors={errors}
        disabled={disabled}
      />
    </div>
  );
}
