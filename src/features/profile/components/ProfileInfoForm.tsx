import { useId, useState, useEffect, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Plus, Sparkles, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormInput } from "@/components/shared/FormInput";
import { PROFILE_LIMITS, RECOMMENDED_SKILLS } from "../constants";
import { useUpdateProfile } from "../hooks";
import type { UserProfile } from "../types";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "../validation";

interface ProfileInfoFormProps {
  profile: UserProfile;
}

export function ProfileInfoForm({ profile }: ProfileInfoFormProps) {
  const bioId = useId();
  const skillsId = useId();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState(RECOMMENDED_SKILLS[0].category);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      skills: profile.skills ?? [],
    },
  });

  useEffect(() => {
    register("skills");
  }, [register]);

  const skills = watch("skills") ?? [];

  function addSkill(skillName?: string) {
    const trimmed = (skillName ?? skillInput).trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      if (!skillName) setSkillInput("");
      return;
    }
    if (skills.length >= PROFILE_LIMITS.maxSkills) return;

    const next = [...skills, trimmed];
    setValue("skills", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (!skillName) setSkillInput("");
  }

  function removeSkill(index: number) {
    const next = skills.filter((_, i) => i !== index);
    setValue("skills", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  const isAtMax = skills.length >= PROFILE_LIMITS.maxSkills;

  const currentCategorySkills =
    RECOMMENDED_SKILLS.find((c) => c.category === activeCategory)?.skills ?? [];

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) =>
        updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          title: values.title || undefined,
          bio: values.bio || undefined,
          skills: values.skills,
        }),
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="profile-first-name"
          label="First name"
          placeholder="John"
          autoComplete="given-name"
          disabled={isPending}
          leftIcon={<User className="size-4" />}
          error={errors.firstName?.message}
          {...register("firstName")}
          required
        />
        <FormInput
          id="profile-last-name"
          label="Last name"
          placeholder="Doe"
          autoComplete="family-name"
          disabled={isPending}
          leftIcon={<User className="size-4" />}
          error={errors.lastName?.message}
          {...register("lastName")}
          required
        />
      </div>

      <FormInput
        id="profile-title"
        label="Title"
        placeholder="Full Stack Developer"
        autoComplete="organization-title"
        disabled={isPending}
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="space-y-1.5">
        <Label
          htmlFor={bioId}
          className="text-xs font-bold text-foreground"
        >
          Bio
        </Label>
        <Textarea
          id={bioId}
          placeholder="Tell us about yourself…"
          disabled={isPending}
          aria-invalid={!!errors.bio}
          className="min-h-24 resize-none bg-background text-xs font-semibold"
          {...register("bio")}
        />
        {errors.bio?.message && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Skills tag input */}
      <div className="space-y-1.5">
        <Label
          htmlFor={skillsId}
          className="text-xs font-bold text-foreground"
        >
          Skills
          <span className="ml-1 font-normal text-muted-foreground">
            ({skills.length}/{PROFILE_LIMITS.maxSkills})
          </span>
        </Label>

        <div className="flex gap-2">
          <Input
            id={skillsId}
            placeholder="e.g. React, Node.js…"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            disabled={isPending || isAtMax}
            className="h-9 flex-1 bg-background text-xs font-semibold"
            maxLength={PROFILE_LIMITS.skillMax}
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => addSkill()}
            disabled={isPending || !skillInput.trim() || isAtMax}
            className="shrink-0 text-xs"
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {/* Added skills pills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="secondary"
                shape="pill"
                className="gap-1 pr-1 text-[11.5px]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  disabled={isPending}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {errors.skills?.message && (
          <p className="text-xs text-destructive">{errors.skills.message}</p>
        )}

        {/* Recommended Skills toggle */}
        {!isAtMax && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSuggestions((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline focus:outline-none"
            >
              <Sparkles className="size-3.5" />
              {showSuggestions ? "Hide" : "Browse"} recommended skills
              {showSuggestions ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>

            {showSuggestions && (
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {RECOMMENDED_SKILLS.map(({ category }) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold transition-colors focus:outline-none ${activeCategory === category
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Skill chips for active category */}
                <div className="flex flex-wrap gap-1.5">
                  {currentCategorySkills.map((skill) => {
                    const alreadyAdded = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={isPending || alreadyAdded || isAtMax}
                        onClick={() => addSkill(skill)}
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none ${alreadyAdded
                          ? "border-primary/30 bg-primary/10 text-primary cursor-default"
                          : isAtMax
                            ? "cursor-not-allowed opacity-50 border-border bg-background text-muted-foreground"
                            : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer"
                          }`}
                      >
                        {alreadyAdded ? null : <Plus className="size-2.5" />}
                        {skill}
                        {alreadyAdded && <span className="text-primary/60">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        disabled={!isDirty}
        className="text-xs font-bold"
      >
        Save changes
      </Button>
    </form>
  );
}
