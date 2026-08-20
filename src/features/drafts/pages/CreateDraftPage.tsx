import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { CreateDraftForm } from "../components/CreateDraftForm";
import { useDraft } from "../hooks/useDraft";

export default function CreateDraftPage() {
  const { id: draftId } = useParams();
  const draftQuery = useDraft(draftId);
  const canStartWorkshop =
    !!draftId && draftQuery.data?.status?.toLowerCase() !== "converted";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm md:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--accent-foreground),var(--primary))]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_35%)]" />

        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Draft setup
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Shape the plan before it becomes a project
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Capture the context the workshop needs, then turn the draft into
              features and tasks without mixing planning work with board
              execution.
            </p>
          </div>

          <div className="rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Handoff
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              Draft workshop
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The next screen is where features and tasks start taking shape.
            </p>
            {canStartWorkshop ? (
              <Button asChild size="sm" className="mt-4 w-full">
                <Link to={ROUTES.DRAFT_WORKSHOP(draftId)}>
                  Start Workshop
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <CreateDraftForm draftId={draftId} />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-primary">
              Draft rhythm
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Define the idea",
                "Tune the context",
                "Enter the workshop",
              ].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm font-semibold text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              Projects are created after the draft workshop.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              This keeps planning flexible and keeps the Kanban board clean once
              execution starts.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
