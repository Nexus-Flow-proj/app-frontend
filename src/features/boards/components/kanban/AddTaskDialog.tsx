// features/boards/components/kanban/AddTaskDialog.tsx


import { useState } from "react";
import { CalendarIcon, Tag, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG } from "../../constants";
import { TaskPriority } from "../../types/enums";
import type { BoardMember, BoardColumn, Priority } from "../../types";


export interface NewTaskFormData {
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  columnId: string;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  columnId: string | null;          
  columns: BoardColumn[];
  members: BoardMember[];
  onClose: () => void;
  onSubmit: (data: NewTaskFormData) => void;
}


const PRIORITIES: Priority[] = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

const DEFAULT_FORM: Omit<NewTaskFormData, "columnId"> = {
  title: "",
  description: "",
  priority: TaskPriority.MEDIUM,
  assigneeId: null,
  dueDate: null,
  tags: [],
};


export function AddTaskDialog({
  isOpen,
  columnId,
  columns,
  members,
  onClose,
  onSubmit,
}: AddTaskDialogProps) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState("");

  const reset = () => {
    setForm(DEFAULT_FORM);
    setTagInput("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const title = form.title.trim();
    if (!title || !columnId) return;

    onSubmit({
      ...form,
      title,
      columnId,
    });

    reset();
    onClose();
  };


  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // ─────────────────────────────────────────────────────────────────────────

  const columnName = columns.find((c) => c.id === columnId)?.name ?? "";
  const canSubmit = form.title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            New task
            {columnName && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                in {columnName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              autoFocus
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="Add more context… (optional)"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, priority: v as Priority }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PRIORITIES.map((p) => {
                      const config = PRIORITY_CONFIG[p];
                      return (
                        <SelectItem key={p} value={p} className="text-sm">
                          <span className="flex items-center gap-2">
                            <span className={cn("size-2 rounded-full", config.dotClass)} />
                            {config.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Assignee
              </label>
              <Select
                value={form.assigneeId ?? "unassigned"}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    assigneeId: v === "unassigned" ? null : v,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-sm text-muted-foreground">
                    Unassigned
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-sm">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="size-3" />
              Due date
            </label>
            <Input
              type="date"
              value={form.dueDate ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dueDate: e.target.value || null,
                }))
              }
              className="h-8 text-xs scheme-dark"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3" />
              Tags
            </label>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {form.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    size="sm"
                    shape="pill"
                    className="font-normal gap-1 pr-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive transition-colors rounded-full"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Add a tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              Press Enter or comma to add a tag
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
