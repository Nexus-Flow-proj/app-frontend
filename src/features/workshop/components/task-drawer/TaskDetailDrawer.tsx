import {
  Calendar,
  Flag,
  Layers3,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TaskPriority, TaskStatus } from "@/types/enums";
import { PRIORITY_CONFIG, STATUS_CONFIG, STICKY_COLORS } from "../../constants";
import { useTaskDetailDrawer } from "../../hooks/useTaskDetailDrawer";
import type { WorkshopObjectKind } from "../../types";
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

interface TaskDetailDrawerProps {
  objectId: Nullable<string>;
}

export function TaskDetailDrawer({ objectId }: TaskDetailDrawerProps) {
  const {
    form,
    isTask,
    isSticky,
    isText,
    isSection,
    kindOptions,
    setValue,
    handleSave,
    handleDelete,
    closeObjectDetails,
  } = useTaskDetailDrawer(objectId);
  const icon = isSticky ? (
    <StickyNote className="h-4 w-4 text-amber-500" />
  ) : isText ? (
    <Type className="h-4 w-4 text-sky-500" />
  ) : (
    <Layers3 className="h-4 w-4 text-primary" />
  );

  return (
    <Sheet
      open={!!objectId}
      onOpenChange={(open) => !open && closeObjectDetails()}
    >
      <SheetContent
        side="right"
        className="flex w-105 flex-col gap-0 p-0 sm:w-105"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isSection
                ? "Section"
                : form.kind}
            </span>
          </div>
          <SheetTitle className="mt-1 text-base font-semibold">
            {isSticky ? "Sticky note" : form.title || "Workshop item"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {(isSticky || isText) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <Select
                  value={form.kind}
                  onValueChange={(value) =>
                    setValue("kind", value as WorkshopObjectKind)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kindOptions.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex h-8 items-center gap-1.5">
                  {STICKY_COLORS.slice(0, 6).map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full border border-border ring-offset-background data-[active=true]:ring-2 data-[active=true]:ring-primary"
                      data-active={form.color === color}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue("color", color)}
                      aria-label={`Use color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isSticky && !isText && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(e) => setValue("title", e.target.value)}
                placeholder="Item title"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {isSticky ? "Note" : isText ? "Text" : "Description"}
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
              className="min-h-24 resize-none text-sm"
              placeholder="Add useful planning context"
            />
          </div>

          {isTask && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setValue("status", value as TaskStatus)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: cfg.dot }}
                            />
                            {cfg.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Flag className="h-3 w-3" /> Priority
                  </label>
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      setValue("priority", value as TaskPriority)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: cfg.dot }}
                            />
                            {cfg.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Due date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setValue("dueDate", e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </>
          )}

          {isText ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Font size</label>
              <Input type="number" min={10} max={72} value={form.fontSize} onChange={(event) => setValue("fontSize", Number(event.target.value))} />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this workshop item?</AlertDialogTitle>
                <AlertDialogDescription>{isSection ? "The section will be removed and its child items will remain on the canvas." : "This action can be undone until the workshop is saved."}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={closeObjectDetails}
            >
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
