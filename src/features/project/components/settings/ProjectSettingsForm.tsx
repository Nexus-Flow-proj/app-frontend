import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/shared/FormInput";
import { PROJECT_COLORS } from "../../constants";
import { useUpdateProject } from "../../hooks";
import type { ProjectDetails } from "../../types";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "../../validation";
import { ProjectColorPicker } from "./ProjectColorPicker";

interface ProjectSettingsFormProps {
  project: ProjectDetails;
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const descriptionId = useId();
  const colorId = useId();
  const { mutate: updateProject, isPending } = useUpdateProject();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    values: {
      name: project.name,
      description: project.description ?? "",
      color: project.color ?? PROJECT_COLORS[0].value,
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
      className="space-y-5"
      onSubmit={handleSubmit((values) =>
        updateProject({
          projectId: project.id,
          name: values.name,
          description: values.description || undefined,
          color: values.color,
        }),
      )}
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

      <ProjectColorPicker
        id={colorId}
        selectedColor={selectedColor}
        disabled={isPending}
        error={errors.color?.message}
        onChange={handleColorChange}
      />
      <input type="hidden" {...register("color")} />

      <Button
        type="submit"
        isLoading={isPending}
        disabled={!isDirty}
        className="w-full text-xs font-bold sm:w-auto"
      >
        Save changes
      </Button>
    </form>
  );
}
