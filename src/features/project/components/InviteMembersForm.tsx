import { useEffect, useMemo } from "react";
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
import { useInviteMember, useProjectRoles } from "../hooks";
import { inviteMemberSchema, type InviteMemberFormValues } from "../validation";

interface InviteMembersFormProps {
  projectId: string;
}

export function InviteMembersForm({ projectId }: InviteMembersFormProps) {
  const { mutate: inviteMember, isPending } = useInviteMember();
  const { data: roles = [], isLoading: isLoadingRoles } =
    useProjectRoles(projectId);
  const defaultRole = useMemo(
    () => roles.find((role) => role.level < 100) ?? roles[0],
    [roles],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  useEffect(() => {
    const selectedRoleId = getValues("roleId");

    if (!selectedRoleId && defaultRole) {
      setValue("roleId", defaultRole.id);
    }
  }, [defaultRole, getValues, setValue]);

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => {
        inviteMember(
          {
            projectId,
            email: values.email,
            roleId: values.roleId,
          },
          {
            onSuccess: () => reset({ email: "", roleId: values.roleId }),
          },
        );
      })}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
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
          name="roleId"
          control={control}
          render={({ field }) => {
            const placeholder = isLoadingRoles ? "Loading roles..." : "Choose role";

            return (
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
                  disabled={isPending || isLoadingRoles || roles.length === 0}
                >
                  <SelectTrigger
                    id="invite-role"
                    className="h-9 w-full min-w-0 bg-background px-3 text-left text-xs font-semibold [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate"
                    aria-invalid={!!errors.roleId}
                  >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    {roles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.id}
                        textValue={role.name}
                        className="min-w-0 py-2 text-xs font-semibold"
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId?.message && (
                  <p className="text-xs text-destructive">
                    {errors.roleId.message}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoadingRoles || roles.length === 0}
        isLoading={isPending}
        className="justify-self-start text-xs font-bold"
      >
        Send invite
      </Button>
    </form>
  );
}
