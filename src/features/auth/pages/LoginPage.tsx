import CardAuth from "../components/CardAuth";
import { LoginForm } from "../components/LoginForm";
import AuthLogo from "../components/AuthLogo";

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 p-8 text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,--theme(--color-primary-500/0.18),transparent_34%),linear-gradient(180deg,--theme(--color-primary-950/0.22),transparent_42%)]" />

      <div className="relative w-full max-w-89">
        <AuthLogo />

        <CardAuth
          title="Welcome back"
          subtitle="Login with your Google account"
        >
          <LoginForm />
        </CardAuth>

        <p className="mx-auto mt-6 max-w-70 text-center text-xs font-medium leading-5 text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="underline underline-offset-2">Terms of Service</span>{" "}
          and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
