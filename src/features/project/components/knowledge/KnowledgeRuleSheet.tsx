import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenText, FileText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/shared/FormInput";
import type { KnowledgeDocument } from "../../types";
import { knowledgeSchema, type KnowledgeFormValues } from "../../validation";
import {
  KNOWLEDGE_SOURCE_OPTIONS,
  KNOWLEDGE_TEMPLATES,
} from "./knowledge-display";

interface KnowledgeRuleSheetProps {
  open: boolean;
  rule?: KnowledgeDocument | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: KnowledgeFormValues) => void;
}

export function KnowledgeRuleSheet({
  open,
  rule,
  isPending = false,
  onOpenChange,
  onSubmit,
}: KnowledgeRuleSheetProps) {
  const contentId = useId();
  const sourceTypeId = useId();
  const isEditing = !!rule;
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      title: "",
      content: "",
      sourceType: "policy",
    },
  });
  const sourceType = useWatch({ control, name: "sourceType" });
  const content = useWatch({ control, name: "content" }) ?? "";

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: rule?.title ?? "",
      content: rule?.content ?? "",
      sourceType: rule?.sourceType ?? "policy",
    });
  }, [open, reset, rule]);

  function applyTemplate(template: string) {
    setValue("content", template, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit knowledge rule" : "Add knowledge rule"}
          </SheetTitle>
          <SheetDescription>
            Keep rules concise so AI retrieval can match them to tasks and
            project questions.
          </SheetDescription>
        </SheetHeader>

        <form
          id="knowledge-rule-form"
          className="grid gap-5 px-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Title"
            placeholder="Backend task assignment policy"
            autoComplete="off"
            disabled={isPending}
            leftIcon={<FileText className="size-4" />}
            error={errors.title?.message}
            {...register("title")}
            required
          />

          <div className="space-y-1.5">
            <Label
              htmlFor={sourceTypeId}
              className="text-xs font-bold text-foreground"
            >
              Type
            </Label>
            <Select
              value={sourceType}
              onValueChange={(value) =>
                setValue(
                  "sourceType",
                  value as KnowledgeFormValues["sourceType"],
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  },
                )
              }
              disabled={isPending}
            >
              <SelectTrigger id={sourceTypeId} className="w-full bg-background">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sourceType?.message && (
              <p className="text-xs text-destructive">
                {errors.sourceType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor={contentId}
                className="text-xs font-bold text-foreground"
              >
                Content<span className="text-destructive">*</span>
              </Label>
              <span className="text-xs font-medium text-muted-foreground">
                {content.length} / 2000
              </span>
            </div>
            <Textarea
              id={contentId}
              placeholder="Describe the rule or project knowledge..."
              disabled={isPending}
              aria-invalid={!!errors.content}
              className="min-h-40 resize-none bg-background text-xs font-semibold leading-5"
              {...register("content")}
            />
            {errors.content?.message ? (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Focus each rule on one decision, policy, or reusable standard.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <BookOpenText className="size-3.5 text-muted-foreground" />
              Quick templates
            </div>
            <div className="flex flex-wrap gap-2">
              {KNOWLEDGE_TEMPLATES.map((template) => (
                <Button
                  key={template}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="h-auto max-w-full justify-start whitespace-normal text-left text-xs"
                  onClick={() => applyTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="knowledge-rule-form"
            isLoading={isPending}
            disabled={isEditing ? !isDirty : false}
          >
            {isEditing ? "Save rule" : "Create rule"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
