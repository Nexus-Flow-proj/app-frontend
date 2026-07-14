import {
  Calendar,
  Layers3,
  ListTodo,
  MapPin,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useTaskDetailDrawer } from "../../hooks/useTaskDetailDrawer";

interface TaskDetailDrawerProps {
  objectId: Nullable<string>;
}

const NOTE_COLORS = [
  { value: "#FEF3C7", label: "Warm yellow" },
  { value: "#FCE7F3", label: "Soft pink" },
  { value: "#DBEAFE", label: "Calm blue" },
  { value: "#D1FAE5", label: "Fresh mint" },
  { value: "#EDE9FE", label: "Light violet" },
] as const;

export function TaskDetailDrawer({ objectId }: TaskDetailDrawerProps) {
  const {
    object,
    form,
    isEditing,
    isTask,
    isNote,
    parentFeatureTitle,
    canSave,
    setValue,
    handleSave,
    handleDelete,
    closeObjectDetails,
  } = useTaskDetailDrawer(objectId);
  const Icon = isNote ? StickyNote : isTask ? ListTodo : Layers3;
  const itemLabel = isNote ? "Sticky note" : isTask ? "Task" : "Feature";
  const displayTitle = isNote
    ? form.noteContent.trim().slice(0, 52) || "Canvas note"
    : form.title || "Workshop item";

  return (
    <Sheet
      open={Boolean(objectId)}
      onOpenChange={(open) => !open && closeObjectDetails()}
    >
      <SheetContent
        side="right"
        className="flex w-105 flex-col gap-0 p-0 sm:w-105"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {itemLabel}
            </span>
            <Badge variant={isEditing ? "default" : "secondary"}>
              {isEditing ? "Draft" : "Read only"}
            </Badge>
          </div>
          <SheetTitle className="mt-1 truncate text-base font-semibold">
            {displayTitle}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {isNote ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workshop-note-content">Note</Label>
                <Textarea
                  id="workshop-note-content"
                  value={form.noteContent}
                  onChange={(event) =>
                    setValue("noteContent", event.target.value)
                  }
                  className="min-h-40 resize-none text-sm"
                  placeholder="Capture an idea or reminder"
                  disabled={!isEditing}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workshop-note-color">Color</Label>
                <Select
                  value={form.noteColor}
                  onValueChange={(value) => setValue("noteColor", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="workshop-note-color" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workshop-item-title">Title</Label>
                <Input
                  id="workshop-item-title"
                  value={form.title}
                  onChange={(event) => setValue("title", event.target.value)}
                  placeholder={isTask ? "Task title" : "Feature title"}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workshop-item-description">Description</Label>
                <Textarea
                  id="workshop-item-description"
                  value={form.description}
                  onChange={(event) =>
                    setValue("description", event.target.value)
                  }
                  className="min-h-28 resize-none text-sm"
                  placeholder={
                    isTask
                      ? "Describe the work required"
                      : "Describe the feature outcome"
                  }
                  disabled={!isEditing}
                />
              </div>
            </>
          )}

          {isTask ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="workshop-task-due-date"
                  className="flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" /> Due date
                </Label>
                <input
                  id="workshop-task-due-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setValue("dueDate", event.target.value)}
                  disabled={!isEditing}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50/70 px-3 py-2.5 text-xs text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Contained by{" "}
                  <span className="font-semibold">
                    {parentFeatureTitle ?? "its canvas feature"}
                  </span>
                  . Move the card inside that feature; assignment is automatic.
                </p>
              </div>
            </>
          ) : null}

          {!isEditing ? (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              Enable edit mode to change this {itemLabel.toLocaleLowerCase()}.
              {isNote
                ? " Sticky notes stay in the Workshop."
                : " Board-only fields are managed from the Team Board."}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          {isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Published canvas
            </span>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={closeObjectDetails}
            >
              {isEditing ? "Cancel" : "Close"}
            </Button>
            {isEditing ? (
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={handleSave}
                disabled={!object || !canSave}
              >
                Save to draft
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
