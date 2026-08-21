import { GitBranch } from "lucide-react";
import { flowSteps } from "../../constants/flowSteps";
import { registerBenefits } from "../../constants/registerBenefits";
import AuthLogo from "../AuthLogo";

function AsideRegister() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-border bg-sidebar/70 px-6 py-20 lg:block">
      {/* <div className="absolute inset-0 bg-[linear-gradient(90deg,--theme(--color-border/0.75)_1px,transparent_1px),linear-gradient(180deg,--theme(--color-border/0.75)_1px,transparent_1px)] bg-size-[28px_28px] opacity-35" /> */}

      <div className="mx-auto max-w-70">
        <AuthLogo />

        <h1 className="text-3xl font-black leading-tight tracking-tight">
          Plan projects visually, then{" "}
          <span className="bg-linear-to-r from-primary to-primary-300 bg-clip-text text-transparent">
            ship with clarity.
          </span>
        </h1>

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
  );
}

export default AsideRegister;
