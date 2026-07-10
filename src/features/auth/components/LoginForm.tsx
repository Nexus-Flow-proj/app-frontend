import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { loginSchema, type LoginFormValues } from "../validation";
import { useLogin } from "../hooks";
import MySeparator from "@/components/shared/MySeparator";
import AuthErrorMessage from "./AuthErrorMessage";
import GoogleAuthBtn from "./GoogleAuthBtn";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5">
      <GoogleAuthBtn
        isPending={isPending}
        text="Login with Google"
        pathname="login"
      />

      <MySeparator text="Or continue with" />

      <FormInput
        id="email"
        label="Email"
        type="text"
        autoComplete="email"
        placeholder="m@example.com"
        disabled={isPending}
        leftIcon={<Mail className="size-4" />}
        error={errors.email?.message}
        {...register("email")}
        required
      />

      <FormInput
        id="password"
        label="Password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        disabled={isPending}
        leftIcon={<Lock className="size-4" />}
        error={errors.password?.message}
        showPasswordToggle
        labelAction={
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        }
        {...register("password")}
        required
      />

      <AuthErrorMessage error={error} />

      <Button
        type="submit"
        isLoading={isPending}
        size="lg"
        className="w-full text-xs font-bold"
      >
        Login
      </Button>
    </form>
  );
}
