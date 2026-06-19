import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Mail, Lock } from "lucide-react";
import { BASE_URL } from "@/constants/BackendApisConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginFormValues } from "../validation";
import { useLogin } from "../hooks";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!error?.errors) {
      return;
    }

    Object.entries(error.errors).forEach(([field, messages]) => {
      if (field === "email" || field === "password") {
        setError(field, {
          message: messages[0],
          type: "server",
        });
      }
    });
  }, [error, setError]);

  function handleGoogleLogin() {
    window.location.href = `${BASE_URL}/auth/google`;
  }

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="h-9 w-full border-border bg-background text-xs font-bold text-foreground shadow-sm hover:bg-muted hover:text-foreground"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
            G
          </span>
          Login with Google
        </Button>
      </div>

      <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        <span>Or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
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
          <Label htmlFor="password" className="text-xs font-bold text-foreground">
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

      {error?.statusCode === 429 && (
        <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
          Too many attempts. Please wait a few minutes before trying again.
        </p>
      )}

      <Button
        type="submit"
        isLoading={isPending}
        className="h-9 w-full text-xs font-bold shadow-sm shadow-primary/20"
      >
        Login
      </Button>

      <p className="text-center text-xs font-semibold text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </form>
  );
}
