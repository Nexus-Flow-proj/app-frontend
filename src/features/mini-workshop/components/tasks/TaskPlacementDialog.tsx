import { ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskPlacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePersonal: () => void;
  onChooseExisting: () => void;
}

export function TaskPlacementDialog({
  open,
  onOpenChange,
  onCreatePersonal,
  onChooseExisting,
}: TaskPlacementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a task here</DialogTitle>
          <DialogDescription>
            Create a private planning card or place references to project tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto items-start justify-start gap-3 p-4 text-left"
            onClick={onCreatePersonal}
          >
            <Sparkles className="mt-0.5 size-5 text-violet-500" />
            <span>
              <span className="block font-semibold">Personal task</span>
              <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">
                A canvas-only task for your own planning.
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-auto items-start justify-start gap-3 p-4 text-left"
            onClick={onChooseExisting}
          >
            <ClipboardList className="mt-0.5 size-5 text-blue-500" />
            <span>
              <span className="block font-semibold">Project tasks</span>
              <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">
                Add one or more read-only Board references.
              </span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

