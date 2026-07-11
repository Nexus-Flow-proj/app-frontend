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
          name="roleId"
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
                disabled={isPending || isLoadingRoles || roles.length === 0}
              >
                <SelectTrigger
                  id="invite-role"
                  className="h-9 w-full bg-background text-xs font-semibold"
                  aria-invalid={!!errors.roleId}
                >
                  <SelectValue
                    placeholder={
                      isLoadingRoles ? "Loading roles..." : "Choose role"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="grid p-0.5 gap-0.5">
                        <span>{role.name}</span>
                        <span className="text-xs  text-muted-foreground">
                          Level {role.level}
                          {role.description ? ` - ${role.description}` : ""}
                        </span>
                      </span>
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
          )}
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
