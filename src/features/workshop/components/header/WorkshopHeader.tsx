import {
  Crosshair,
  KanbanSquare,
  Loader2,
  Maximize2,
  Pencil,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADD_ITEMS } from "../../constants/addItemsKind";
import { useWorkshopHeader } from "../../hooks/useWorkshopHeader";
import { WORKSHOP_MOCK_MODE } from "../../constants";

interface WorkshopHeaderProps {
  stageSize: {
    width: number;
    height: number;
  };
  isPlanReady: boolean;
}

function WorkshopHeader({ stageSize, isPlanReady }: WorkshopHeaderProps) {
  const {
    isDirty,
    isEditing,
    isPublishing,
    canEdit,
    beginEdit,
    discardDraft,
    publishPlan,
    openBoard,
    handleAddItem,
    handleFitView,
    handleResetView,
  } = useWorkshopHeader(stageSize);

  return (
    <div className="flex min-h-16 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          <h1 className="truncate text-sm font-semibold">Main Workshop</h1>
          <Badge variant={isEditing ? "default" : "secondary"}>
            {isEditing ? "Draft mode" : "Read only"}
          </Badge>
          {WORKSHOP_MOCK_MODE ? (
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              Mock data
            </Badge>
          ) : null}
          {isEditing && isDirty ? (
            <span className="text-[11px] font-medium text-amber-600">
              Unsaved changes
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Shape the full plan here; features and tasks sync to the Team Board.
        </p>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        {isEditing
          ? ADD_ITEMS.map(({ kind, icon: Icon }) => (
              <Button
                key={kind}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleAddItem(kind)}
                disabled={isPublishing}
              >
                <Icon className="h-3.5 w-3.5" />
                Add {kind.toLocaleLowerCase()}
              </Button>
            ))
          : null}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitView}
          aria-label="Fit workshop view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          aria-label="Reset workshop view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button variant="outline" size="sm" onClick={openBoard}>
          <KanbanSquare className="h-3.5 w-3.5" />
          Team Board
        </Button>

        {isEditing ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPublishing}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Revert
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every workshop change made since edit mode started will be
                    removed. The published board plan will stay unchanged.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep editing</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={discardDraft}
                  >
                    Discard draft
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              size="sm"
              onClick={publishPlan}
              disabled={!isDirty || isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isPublishing ? "Saving" : "Save & sync board"}
            </Button>
          </>
        ) : canEdit ? (
          <Button size="sm" onClick={beginEdit} disabled={!isPlanReady}>
            <Pencil className="h-3.5 w-3.5" />
            Edit plan
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default WorkshopHeader;
