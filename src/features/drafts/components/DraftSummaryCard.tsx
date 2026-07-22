import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInitials } from "@/lib/format/text";
import { cn } from "@/lib/utils";
import { DRAFT_CATEGORY_OPTIONS, DRAFT_COLORS } from "../constants";
import type { CreateDraftDto } from "../types";

interface DraftSummaryCardProps {
  draft: CreateDraftDto;
}

export function DraftSummaryCard({ draft }: DraftSummaryCardProps) {
  const { projectInfo } = draft;
  const color = DRAFT_COLORS.find((item) => item.value === projectInfo.color);
  const title = projectInfo.name || "Untitled draft";
  const category = DRAFT_CATEGORY_OPTIONS.find(
    (item) => item.value === projectInfo.constraints?.category,
  );
  const constraints = projectInfo.constraints;
  const primaryConstraint =
    constraints?.targetStack?.join(", ") ||
    constraints?.marketingChannels?.join(", ") ||
    constraints?.designDeliverables?.join(", ") ||
    constraints?.generalFocus?.join(", ") ||
    "General planning";
  const secondaryConstraint =
    constraints?.preferredLanguage ||
    constraints?.targetAudience ||
    constraints?.designTools?.join(", ") ||
    constraints?.generalContext ||
    "Flexible setup";

  return (
    <Card className="overflow-hidden rounded-xl border-primary/10 bg-background/80 shadow-sm">
      <CardHeader className="gap-5 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white ring-1 ring-foreground/10",
              color?.swatchClassName ?? "bg-primary",
            )}
          >
            {formatInitials(title)}
          </span>
          <div className="min-w-0 flex-1 flex flex-col justify-around ">
            <CardTitle className="text-3xl font-semibold tracking-normal">
              {title}
            </CardTitle>
            <p className=" max-w-3xl text-base leading-7 text-muted-foreground">
              {projectInfo.description || "No description added yet."}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6 pt-0">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Category
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {category?.label ?? "General"}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Focus
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {primaryConstraint}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Timeline
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {projectInfo.estimatedTime}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Secondary context
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {secondaryConstraint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
