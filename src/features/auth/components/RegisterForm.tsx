import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Eye, Lock, Mail, User, Workflow } from "lucide-react";
import { BASE_URL } from "@/constants/BackendApisConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerSchema, type RegisterFormValues } from "../validation";
import { useRegister } from "../hooks";

export function RegisterForm() {
  const { mutate: register_, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      preference: "",
    },
  });

  const serverMessages = Array.isArray(error?.message)
    ? error.message
    : error?.message
      ? [error.message]
      : [];

  function handleGoogleSignup() {
    window.location.href = `${BASE_URL}/auth/google`;
  }

  return (
    <form
      onSubmit={handleSubmit((data) => register_(data))}
      className="space-y-5"
    >
      <fieldset className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Personal Info
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-bold text-foreground">
            Username <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              autoComplete="username"
              placeholder="Enter Your UserName"
              disabled={isPending}
              className="h-9 bg-background pl-9 text-xs font-semibold"
              {...register("username")}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-bold text-foreground">
              First Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Enter First Name"
                disabled={isPending}
                aria-invalid={!!errors.firstName}
                className="h-9 bg-background pl-9 text-xs font-semibold"
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-bold text-foreground">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Enter Last Name"
                disabled={isPending}
                aria-invalid={!!errors.lastName}
                className="h-9 bg-background pl-9 text-xs font-semibold"
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Account Details
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-foreground">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              disabled={isPending}
              aria-invalid={!!errors.email || error?.statusCode === 409}
              className="h-9 bg-background pl-9 text-xs font-semibold"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
          {error?.statusCode === 409 && (
            <p className="text-xs text-destructive">This email is already in use.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-foreground">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                disabled={isPending}
                aria-invalid={!!errors.password}
                className="h-9 bg-background px-9 text-xs font-semibold"
                {...register("password")}
              />
              <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm"
                disabled={isPending}
                aria-invalid={!!errors.confirmPassword}
                className="h-9 bg-background px-9 text-xs font-semibold"
                {...register("confirmPassword")}
              />
              <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Preferences
          </span>
          <Badge variant="secondary" className="h-5 text-[9px] uppercase">
            Optional
          </Badge>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preference" className="text-xs font-bold text-foreground">
            User Preference
          </Label>
          <div className="relative">
            <Workflow className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="preference"
              placeholder="Enter Your Preference"
              disabled={isPending}
              className="h-9 bg-background pl-9 text-xs font-semibold"
              {...register("preference")}
            />
          </div>
        </div>
      </fieldset>

      {error?.statusCode === 429 && (
        <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
          Too many signup attempts. Please wait a few minutes before trying again.
        </p>
      )}

      {error && error.statusCode !== 409 && error.statusCode !== 429 && serverMessages.length > 0 && (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {serverMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}

      <Button
        type="submit"
        isLoading={isPending}
        className="h-9 w-full text-xs font-bold shadow-sm shadow-primary/20"
      >
        Register
      </Button>

      <div className="flex items-center gap-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Separator className="flex-1" />
        <span>Or signup with</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        disabled={isPending}
        className="h-9 w-full bg-background text-xs font-bold"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
          G
        </span>
        Google
      </Button>

      <p className="text-center text-xs font-bold text-muted-foreground">
        Already have an Account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
