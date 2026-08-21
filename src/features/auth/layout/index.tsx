import { Outlet } from "react-router";
import AuthLogo from "../components/AuthLogo";
export default function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-8 text-foreground">
      {/* <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,--theme(--color-primary-500/0.12),transparent_34%),linear-gradient(180deg,--theme(--color-muted/0.55),transparent_42%)]" /> */}

      <div className="relative w-full max-w-95">
        <AuthLogo />

        <Outlet />
      </div>
    </main>
  );
}
