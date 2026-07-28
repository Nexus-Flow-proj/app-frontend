import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateDraft, useDraft, useUpdateDraft } from "../hooks";
import { denormalizeDraftPayload } from "../utils/denormalizeDraftPayload";
import { normalizeDraftPayload } from "../utils/normalizeDraftPayload";
import {
  createDraftDefaultValues,
  createDraftSchema,
  type CreateDraftFormValues,
} from "../validation";
import { DraftBasicsStep } from "./DraftBasicsStep";
import { DraftCategoryStep } from "./DraftCategoryStep";
import { DraftFormActions } from "./DraftFormActions";
import { DraftSummaryCard } from "./DraftSummaryCard";
import { DraftStepper } from "./DraftStepper";
import { DRAFT_FORM_STEPS } from "./draftStepConfig";

interface CreateDraftFormProps {
  draftId?: string;
}

export function CreateDraftForm({ draftId }: CreateDraftFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const { data: draft, isLoading: isLoadingDraft } = useDraft(draftId);
  const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();
  const { mutate: updateDraft, isPending: isUpdatingDraft } = useUpdateDraft();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateDraftFormValues>({
    resolver: zodResolver(createDraftSchema),
    defaultValues: createDraftDefaultValues,
    mode: "onTouched",
  });
  const isPending = isCreatingDraft || isUpdatingDraft || isLoadingDraft;

  const name = useWatch({ control, name: "name" });
  const description = useWatch({ control, name: "description" });
  const selectedColor = useWatch({ control, name: "color" });
  const selectedCategory = useWatch({ control, name: "category" });
  const targetStack = useWatch({ control, name: "targetStack" });
  const customTargetStack = useWatch({ control, name: "customTargetStack" });
  const preferredLanguage = useWatch({ control, name: "preferredLanguage" });
  const customPreferredLanguage = useWatch({
    control,
    name: "customPreferredLanguage",
  });
  const marketingChannels = useWatch({ control, name: "marketingChannels" });
  const customMarketingChannels = useWatch({
    control,
    name: "customMarketingChannels",
  });
  const targetAudience = useWatch({ control, name: "targetAudience" });
  const customTargetAudience = useWatch({
    control,
    name: "customTargetAudience",
  });
  const designDeliverables = useWatch({ control, name: "designDeliverables" });
  const customDesignDeliverables = useWatch({
    control,
    name: "customDesignDeliverables",
  });
  const designTools = useWatch({ control, name: "designTools" });
  const customDesignTools = useWatch({ control, name: "customDesignTools" });
  const generalFocus = useWatch({ control, name: "generalFocus" });
  const generalContext = useWatch({ control, name: "generalContext" });
  const estimatedTimeWeeks = useWatch({ control, name: "estimatedTimeWeeks" });

  const summary = normalizeDraftPayload({
    name,
    description,
    color: selectedColor,
    category: selectedCategory,
    targetStack,
    customTargetStack,
    preferredLanguage,
    customPreferredLanguage,
    marketingChannels,
    customMarketingChannels,
    targetAudience,
    customTargetAudience,
    designDeliverables,
    customDesignDeliverables,
    designTools,
    customDesignTools,
    generalFocus,
    generalContext,
    estimatedTimeWeeks,
  });

  const stepFields: Array<Array<keyof CreateDraftFormValues>> = [
    ["name", "description", "color"],
    [
      "category",
      "targetStack",
      "customTargetStack",
      "preferredLanguage",
      "customPreferredLanguage",
      "marketingChannels",
      "customMarketingChannels",
      "targetAudience",
      "customTargetAudience",
      "designDeliverables",
      "customDesignDeliverables",
      "designTools",
      "customDesignTools",
      "generalFocus",
      "generalContext",
      "estimatedTimeWeeks",
    ],
    [],
  ];
  const activeStep = DRAFT_FORM_STEPS[stepIndex];

  useEffect(() => {
    if (!draft) {
      return;
    }

    reset(denormalizeDraftPayload(draft));
  }, [draft, reset]);

  async function goNext() {
    const isStepValid = await trigger(stepFields[stepIndex], {
      shouldFocus: true,
    });

    if (isStepValid) {
      setStepIndex((index) => Math.min(index + 1, DRAFT_FORM_STEPS.length - 1));
    }
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleStepChange(nextStepIndex: number) {
    if (nextStepIndex <= stepIndex) {
      setStepIndex(nextStepIndex);
    }
  }

  function submitDraft(values: CreateDraftFormValues) {
    const dto = normalizeDraftPayload(values);

    if (draftId) {
      updateDraft({ draftId, dto });
      return;
    }

    createDraft(dto);
  }

  return (
    <form
      onSubmit={(event) => {
        if (stepIndex !== DRAFT_FORM_STEPS.length - 1) {
          event.preventDefault();
          void goNext();
          return;
        }

        void handleSubmit(submitDraft)(event);
      }}
      className="space-y-5"
    >
      <DraftStepper
        steps={DRAFT_FORM_STEPS}
        currentStep={stepIndex}
        onStepChange={handleStepChange}
      />

      <Card className="rounded-xl py-1 bg-card shadow-sm">
        <div className="px-5 pt-5 md:px-6 md:pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Step {stepIndex + 1} of {DRAFT_FORM_STEPS.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-normal">
                {activeStep.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeStep.description}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-5 md:p-6">
          <div className="min-h-[300px] space-y-5 md:min-h-[330px]">
            {stepIndex === 0 && (
              <DraftBasicsStep
                register={register}
                setValue={setValue}
                selectedColor={selectedColor}
                errors={errors}
                disabled={isPending}
              />
            )}

            {stepIndex === 1 && (
              <DraftCategoryStep
                register={register}
                setValue={setValue}
                selectedCategory={selectedCategory}
                targetStack={targetStack}
                preferredLanguage={preferredLanguage}
                marketingChannels={marketingChannels}
                targetAudience={targetAudience}
                designDeliverables={designDeliverables}
                designTools={designTools}
                errors={errors}
                disabled={isPending}
              />
            )}

            {stepIndex === 2 && <DraftSummaryCard draft={summary} />}
          </div>
        </CardContent>
      </Card>

      <DraftFormActions
        currentStep={stepIndex}
        stepsCount={DRAFT_FORM_STEPS.length}
        isPending={isPending}
        onBack={goBack}
        onNext={goNext}
      />
    </form>
  );
}
