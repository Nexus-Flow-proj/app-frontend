import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/shared/FormInput";
import { cn } from "@/lib/utils";
import { DEFAULT_PROJECT_COLOR, PROJECT_COLORS } from "../constants";
import { useCreateProject } from "../hooks";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "../validation";

export function CreateProjectForm() {
  const descriptionId = useId();
  const colorId = useId();
  const { mutate: createProject, isPending } = useCreateProject();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: DEFAULT_PROJECT_COLOR,
    },
  });

  const selectedColor = useWatch({ control, name: "color" });

  function handleColorChange(color: string) {
    setValue("color", color, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        createProject({
          ...values,
          description: values.description || undefined,
        }),
      )}
      className="space-y-5"
    >
      <FormInput
        id="project-name"
        label="Project name"
        placeholder="Mobile app redesign"
        autoComplete="off"
        disabled={isPending}
        leftIcon={<FolderKanban className="size-4" />}
        error={errors.name?.message}
        {...register("name")}
        required
      />

      <div className="space-y-1.5">
        <Label
          htmlFor={descriptionId}
          className="text-xs font-bold text-foreground"
        >
          Description
        </Label>
        <Textarea
          id={descriptionId}
          placeholder="What is this project about?"
          disabled={isPending}
          aria-invalid={!!errors.description}
          className="min-h-24 resize-none bg-background text-xs font-semibold"
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label id={colorId} className="text-xs font-bold text-foreground">
          Project color<span className="text-destructive">*</span>
        </Label>
        <div
          role="radiogroup"
          aria-labelledby={colorId}
          className="grid grid-cols-3 gap-2 sm:grid-cols-6"
        >
          {PROJECT_COLORS.map((color) => {
            const isSelected = selectedColor === color.value;

            return (
              <Button
                key={color.value}
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                aria-pressed={isSelected}
                className={cn(
                  "h-10 justify-start gap-2 px-2 text-xs",
                  isSelected && "border-primary ring-2 ring-primary/25",
                )}
                onClick={() => handleColorChange(color.value)}
              >
                <span
                  className={cn(
                    "size-4 rounded-full ring-1 ring-foreground/10",
                    color.swatchClassName,
                  )}
                />
                <span className="min-w-0 truncate">{color.name}</span>
              </Button>
            );
          })}
        </div>
        <input type="hidden" {...register("color")} />
        {errors.color?.message && (
          <p className="text-xs text-destructive">{errors.color.message}</p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        size="lg"
        className="w-full text-xs font-bold"
      >
        Create project
      </Button>
    </form>
  );
}
