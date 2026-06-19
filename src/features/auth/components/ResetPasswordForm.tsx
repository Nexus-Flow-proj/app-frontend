import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../validation";
import { useResetPassword } from "../hooks";

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!error?.errors) {
      return;
    }

    Object.entries(error.errors).forEach(([field, messages]) => {
      if (field === "newPassword" || field === "confirmPassword") {
        setError(field, {
          message: messages[0],
          type: "server",
        });
      }
    });
  }, [error, setError]);

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
      className="space-y-5"
    >
      <input type="hidden" {...register("token")} />

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
          New password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            disabled={isPending}
            aria-invalid={!!errors.newPassword}
            className="h-9 bg-background pl-10"
            {...register("newPassword")}
          />
        </div>
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            disabled={isPending}
            aria-invalid={!!errors.confirmPassword}
            className="h-9 bg-background pl-10"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        className="h-9 w-full font-bold shadow-sm shadow-primary/20"
      >
        Reset password
      </Button>
    </form>
  );
}
