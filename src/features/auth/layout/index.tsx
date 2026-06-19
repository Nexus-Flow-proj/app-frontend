import { Outlet, useLocation } from "react-router";
import { Layers, Sparkles, GitBranch } from "lucide-react";
import { flowSteps } from "../constants/flowSteps";
import { registerBenefits } from "../constants/registerBenefits";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isRegister = pathname.includes("register");

  if (!isRegister) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,--theme(--color-primary-500/0.18),transparent_34%),linear-gradient(180deg,--theme(--color-primary-950/0.22),transparent_42%)]" />

        <div className="relative w-full max-w-89">
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-bold">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Layers className="size-3.5" />
            </div>
            <span>
              Nexus<span className="text-primary">-Flow</span>
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card/95 px-5 py-6 shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur">
            <Outlet />
          </div>

          <p className="mx-auto mt-6 max-w-70 text-center text-xs font-medium leading-5 text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <span className="underline underline-offset-2">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2">Privacy Policy</span>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className=" min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,--theme(--color-primary-500/0.22),transparent_30%),radial-gradient(circle_at_78%_12%,--theme(--color-primary-300/0.12),transparent_26%)]" />
      <div className="grid min-h-screen lg:grid-cols-[390px_1fr]">
        <aside className="relative hidden overflow-hidden border-r border-border bg-sidebar/70 px-6 py-20 lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,--theme(--color-primary-950/0.28)_1px,transparent_1px),linear-gradient(180deg,--theme(--color-primary-950/0.28)_1px,transparent_1px)] bg-size-[28px_28px] opacity-25" />
          <div className="mx-auto max-w-70">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 text-primary shadow-sm shadow-primary/20">
                <Sparkles className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-wide">
                  Nexus<span className="text-primary">-Flow</span>
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground">
                  Intelligent team workspaces
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight">
              Plan projects visually, then{" "}
              <span className="bg-linear-to-r from-primary to-primary-300 bg-clip-text text-transparent">
                ship with clarity.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Build project maps, assign work, and keep every teammate aligned
              from one focused workspace.
            </p>

            <div className="my-8 rounded-xl border border-border bg-card/70 p-4 shadow-xl shadow-black/10">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <GitBranch className="size-4 text-primary" />
                Today&apos;s flow
              </div>
              <div className="space-y-2">
                {flowSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-primary ${step.widthClassName}`}
                      />
                    </div>
                    <span className="w-16 text-[10px] font-semibold text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {registerBenefits.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-117.5 rounded-xl border border-border bg-card/95 px-6 py-8 shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur md:px-7">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
