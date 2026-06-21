import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../validation";
import { useResetPassword } from "../hooks";
import AuthErrorMessage from "./AuthErrorMessage";

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/15">
          <AlertCircle className="size-6 text-red-300" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Invalid reset link
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This link is missing a reset token. Please request a new one.
          </p>
        </div>
        <Link
          to="/forgot-password"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => resetPassword(data))}
      className="space-y-6"
    >
      <input type="hidden" {...register("token")} />

      <FormInput
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        disabled={isPending}
        leftIcon={<Lock className="size-4" />}
        labelClassName="text-sm font-medium"
        error={errors.newPassword?.message}
        showPasswordToggle
        {...register("newPassword")}
      />

      <FormInput
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        disabled={isPending}
        leftIcon={<Lock className="size-4" />}
        labelClassName="text-sm font-medium"
        error={errors.confirmPassword?.message}
        showPasswordToggle
        {...register("confirmPassword")}
      />

      <AuthErrorMessage error={error} />

      <Button
        type="submit"
        isLoading={isPending}
        size="lg"
        className="w-full text-xs font-bold"
      >
        Reset password
      </Button>
    </form>
  );
}
