import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormInput } from "@/components/shared/FormInput";
import { ProjectRole } from "@/types";
import { PROJECT_ROLE_OPTIONS } from "../constants";
import { useInviteMember } from "../hooks";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "../validation";

interface InviteMembersFormProps {
  projectId: string;
}

export function InviteMembersForm({ projectId }: InviteMembersFormProps) {
  const { mutate: inviteMember, isPending } = useInviteMember();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      roleLabel: ProjectRole.EDITOR,
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => {
        inviteMember(
          {
            projectId,
            email: values.email,
            roleLabel: values.roleLabel,
          },
          {
            onSuccess: () => reset({ email: "", roleLabel: values.roleLabel }),
          },
        );
      })}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <FormInput
          id="invite-email"
          type="email"
          label="Email address"
          placeholder="member@example.com"
          autoComplete="email"
          disabled={isPending}
          leftIcon={<MailPlus className="size-4" />}
          error={errors.email?.message}
          {...register("email")}
          required
        />

        <Controller
          name="roleLabel"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label
                htmlFor="invite-role"
                className="text-xs font-bold text-foreground"
              >
                Role<span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger
                  id="invite-role"
                  className="h-9 w-full bg-background text-xs font-semibold"
                  aria-invalid={!!errors.roleLabel}
                >
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="grid gap-0.5">
                        <span>{role.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleLabel?.message && (
                <p className="text-xs text-destructive">
                  {errors.roleLabel.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        className="justify-self-start text-xs font-bold"
      >
        Send invite
      </Button>
    </form>
  );
}
