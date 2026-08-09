import { ArrowLeft, Check, CloudAlert, LoaderCircle, PanelLeft, Save } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/shared/ModeToggle";
import type { DraftSummary } from "@/features/drafts/types";

interface WorkshopHeaderProps {
  draft?: DraftSummary;
  isDirty: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  hasCanvas: boolean;
  onSave: () => void;
  onSubmit: () => void;
  onOpenExplorer?: () => void;
}

export default function WorkshopHeader({
  draft,
  isDirty,
  isSaving,
  isGenerating,
  isSubmitting,
  canSubmit,
  hasCanvas,
  onSave,
  onSubmit,
  onOpenExplorer,
}: WorkshopHeaderProps) {
  return (
    <header className="flex min-h-16 flex-wrap items-center gap-3 border-b bg-background/95 px-3 py-2 backdrop-blur md:px-5">
      <Button variant="ghost" size="icon" asChild aria-label="Back to draft">
        <Link to={draft?.id ? `/drafts/${draft.id}` : "/dashboard"}>
          <ArrowLeft />
        </Link>
      </Button>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold md:text-base">
            {draft?.projectInfo.name || "Onboarding Workshop"}
          </h1>
          {isGenerating ? (
            <Badge variant="secondary" className="gap-1"><LoaderCircle className="size-3 animate-spin" /> AI planning</Badge>
          ) : isSaving ? (
            <Badge variant="secondary" className="gap-1"><LoaderCircle className="size-3 animate-spin" /> Saving</Badge>
          ) : isDirty ? (
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600"><CloudAlert className="size-3" /> Unsaved</Badge>
          ) : hasCanvas ? (
            <Badge variant="outline" className="gap-1 text-emerald-600"><Check className="size-3" /> Saved</Badge>
          ) : null}
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">Onboarding Workshop · Shape the plan before creating the project</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        {onOpenExplorer ? (
          <Button variant="outline" size="icon" className="md:hidden" onClick={onOpenExplorer} aria-label="Open canvas explorer"><PanelLeft /></Button>
        ) : null}
        <Button variant="outline" size="sm" className="gap-2" disabled={!isDirty || isSaving || isGenerating || !hasCanvas} onClick={onSave}>
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button size="sm" disabled={!canSubmit || isSubmitting} onClick={onSubmit}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Create project
        </Button>
      </div>
    </header>
  );
}
