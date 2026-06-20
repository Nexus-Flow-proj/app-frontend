import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "../validation";
import { useLogin } from "../hooks";
import { Badge } from "@/components/ui/badge";
import MySeparator from "@/components/shared/MySeparator";
import { handleGoogleLogin } from "../utils/googleLogin";
import AuthErrorMessage from "./AuthErrorMessage";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="w-full font-bold"
      >
        <Badge
          variant="outline"
          shape={"circle"}
          size="xs"
          className="text-primary font-extrabold border-primary/50"
        >
          G
        </Badge>
        Login with Google
      </Button>

      <MySeparator text="Or continue with" />

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="text"
            autoComplete="email"
            placeholder="m@example.com"
            disabled={isPending}
            aria-invalid={!!errors.email}
            className="h-9 bg-background pl-9 text-xs font-semibold"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-xs font-bold text-foreground"
          >
            Password
          </Label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            aria-invalid={!!errors.password}
            className="h-9 bg-background pl-9 text-xs font-semibold"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

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
