import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Separator } from "@/components/ui/separator";
import { registerSchema, type RegisterFormValues } from "../../validation";
import { useRegister } from "../../hooks";
import AuthErrorMessage from "../AuthErrorMessage";
import GoogleAuthBtn from "../GoogleAuthBtn";
import MySeparator from "@/components/shared/MySeparator";

export function RegisterForm() {
  const { mutate: register_, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => register_(data))}
      className="space-y-6"
    >
      <fieldset className="space-y-4">
        <MySeparator
          text="Personal Info"
          isAlignStart={true}
          className="text-primary tracking-wide"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput
            id="firstName"
            label="First Name"
            autoComplete="given-name"
            placeholder="Enter First Name"
            disabled={isPending}
            required
            leftIcon={<User className="size-4" />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <FormInput
            id="lastName"
            label="Last Name"
            autoComplete="family-name"
            placeholder="Enter Last Name"
            disabled={isPending}
            required
            leftIcon={<User className="size-4" />}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Account Details
          </span>
          <Separator className="flex-1" />
        </div>

        <FormInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          disabled={isPending}
          required
          leftIcon={<Mail className="size-4" />}
          error={errors.email?.message}
          aria-invalid={!!errors.email || error?.statusCode === 409}
          {...register("email")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            disabled={isPending}
            required
            leftIcon={<Lock className="size-4" />}
            error={errors.password?.message}
            showPasswordToggle
            {...register("password")}
          />

          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm"
            disabled={isPending}
            required
            leftIcon={<Lock className="size-4" />}
            error={errors.confirmPassword?.message}
            showPasswordToggle
            {...register("confirmPassword")}
          />
        </div>
      </fieldset>

      <AuthErrorMessage error={error} />

      <Button
        type="submit"
        isLoading={isPending}
        className="w-full text-xs font-bold"
        size="lg"
      >
        Register
      </Button>

      <MySeparator text="Or signup with" />

      <GoogleAuthBtn isPending={isPending} pathname="login" />
    </form>
  );
}
