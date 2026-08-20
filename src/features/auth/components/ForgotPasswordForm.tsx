import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../validation";
import { useForgotPassword } from "../hooks";
import AuthErrorMessage from "./AuthErrorMessage";

export function ForgotPasswordForm() {
  const {
    mutate: forgotPassword,
    isPending,
    isSuccess,
    error,
  } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="size-6 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Check your email
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a reset link to your inbox. It expires soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => forgotPassword(data))}
      className="space-y-6"
    >
      <FormInput
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        disabled={isPending}
        leftIcon={<Mail className="size-4" />}
        labelClassName="text-sm font-medium"
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthErrorMessage error={error} />

      <Button
        type="submit"
        isLoading={isPending}
        size="lg"
        className="w-full text-xs font-bold"
      >
        Send reset link
      </Button>
    </form>
  );
}
