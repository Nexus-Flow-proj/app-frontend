import { useState } from "react";
import {
  Calendar,
  Flag,
  Layers3,
  StickyNote,
  Trash2,
  User,
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
import { CanvasObjectType, TaskPriority, TaskStatus } from "@/types/enums";
import { PRIORITY_CONFIG, STATUS_CONFIG, STICKY_COLORS } from "../../constants";
import { useWorkshopStore } from "../../store/workshopStore";
import type {
  SectionFrameData,
  SectionFrameKind,
  StickyNoteData,
  StickyNoteKind,
  TaskCardData,
  TaskCardKind,
  WorkshopObjectKind,
} from "../../types";

interface TaskDetailDrawerProps {
  objectId: Nullable<string>;
}

type FormState = {
  kind: WorkshopObjectKind;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  dueDate: string;
  color: string;
};

const defaultForm: FormState = {
  kind: "Task",
  title: "",
  description: "",
  status: TaskStatus.BACKLOG,
  priority: TaskPriority.MEDIUM,
  assigneeName: "",
  dueDate: "",
  color: "#FEF08A",
};

const TASK_KIND_OPTIONS: TaskCardKind[] = [
  "Task",
  "Milestone",
  "Decision",
  "Risk",
];
const STICKY_KIND_OPTIONS: StickyNoteKind[] = ["Note"];
const SECTION_KIND_OPTIONS: SectionFrameKind[] = ["Project", "Phase"];

function formFromObject(
  obj: ReturnType<typeof useWorkshopStore.getState>["objects"][number] | null,
): FormState {
  if (!obj) return defaultForm;

  if (obj.type === CanvasObjectType.TASK_CARD) {
    const data = obj.data as TaskCardData;
    return {
      kind: data.kind ?? "Task",
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      priority: data.priority,
      assigneeName: data.assigneeName ?? "",
      dueDate: data.dueDate ?? "",
      color: defaultForm.color,
    };
  }

  if (obj.type === CanvasObjectType.STICKY_NOTE) {
    const data = obj.data as StickyNoteData;
    return {
      ...defaultForm,
      kind: data.kind ?? "Note",
      title: "Sticky note",
      description: data.content,
      color: data.color,
    };
  }

  if (obj.type === CanvasObjectType.SECTION_FRAME) {
    const data = obj.data as SectionFrameData;
    return {
      ...defaultForm,
      kind: data.kind ?? "Phase",
      title: data.title,
      description: data.description ?? "",
      color: data.backgroundColor,
    };
  }

  return defaultForm;
}

export function TaskDetailDrawer({ objectId }: TaskDetailDrawerProps) {
  const objects = useWorkshopStore((s) => s.objects);
  const updateObject = useWorkshopStore((s) => s.updateObject);
  const deleteObject = useWorkshopStore((s) => s.deleteObject);
  const closeObjectDetails = useWorkshopStore((s) => s.closeObjectDetails);
  const obj = objectId
    ? (objects.find((o) => o.id === objectId) ?? null)
    : null;
  const [form, setForm] = useState<FormState>(() => formFromObject(obj));

  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!obj || !form.title.trim()) return;

    if (obj.type === CanvasObjectType.TASK_CARD) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as TaskCardData),
          kind: form.kind as TaskCardKind,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          priority: form.priority,
          assigneeName: form.assigneeName.trim() || undefined,
          dueDate: form.dueDate || undefined,
        },
      });
    }

    if (obj.type === CanvasObjectType.STICKY_NOTE) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as StickyNoteData),
          kind: form.kind as StickyNoteKind,
          content: form.description.trim() || "Empty note",
          color: form.color,
        },
      });
    }

    if (obj.type === CanvasObjectType.SECTION_FRAME) {
      updateObject(obj.id, {
        data: {
          ...(obj.data as SectionFrameData),
          kind: form.kind as SectionFrameKind,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          backgroundColor: form.color,
        },
      });
    }

    closeObjectDetails();
  };

  const handleDelete = () => {
    if (!obj) return;
    deleteObject(obj.id);
    closeObjectDetails();
  };

  const statusCfg = STATUS_CONFIG[form.status] ?? STATUS_CONFIG.BACKLOG;
  const priorityCfg = PRIORITY_CONFIG[form.priority] ?? PRIORITY_CONFIG.LOW;
  const isTask = obj?.type === CanvasObjectType.TASK_CARD;
  const isSticky = obj?.type === CanvasObjectType.STICKY_NOTE;
  const kindOptions: WorkshopObjectKind[] =
    obj?.type === CanvasObjectType.SECTION_FRAME
      ? SECTION_KIND_OPTIONS
      : isSticky
        ? STICKY_KIND_OPTIONS
        : TASK_KIND_OPTIONS;
  const icon = isSticky ? (
    <StickyNote className="h-4 w-4 text-amber-500" />
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
        className="flex w-[420px] flex-col gap-0 p-0 sm:w-[420px]"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {obj?.type === CanvasObjectType.SECTION_FRAME
                ? "Section"
                : form.kind}
            </span>
          </div>
          <SheetTitle className="mt-1 text-base font-semibold">
            {isSticky ? "Sticky note" : form.title || "Workshop item"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
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

            {isSticky ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex h-8 items-center gap-1.5">
                  {STICKY_COLORS.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-5 w-5 rounded-full border border-border ring-offset-background data-[active=true]:ring-2 data-[active=true]:ring-primary"
                      data-active={form.color === color}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue("color", color)}
                      aria-label={`Use color ${color}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {!isSticky && (
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
              {isSticky ? "Note" : "Description"}
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
              className="min-h-[96px] resize-none text-sm"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <User className="h-3 w-3" /> Assignee
                  </label>
                  <Input
                    value={form.assigneeName}
                    onChange={(e) => setValue("assigneeName", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Name"
                  />
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
              </div>

              <div className="flex gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium"
                  style={{ background: statusCfg.bg, color: statusCfg.text }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusCfg.dot }}
                  />
                  {statusCfg.label}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium"
                  style={{
                    background: priorityCfg.bg,
                    color: priorityCfg.text,
                  }}
                >
                  <Flag className="h-3 w-3" />
                  {priorityCfg.label}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
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
