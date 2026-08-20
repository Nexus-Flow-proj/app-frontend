// features/boards/components/kanban/AddColumnDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLUMN_COLORS = [
  { label: "Purple", value: "#8b5cf6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Green", value: "#22c55e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
] as const;

const DEFAULT_COLOR = COLUMN_COLORS[0].value;
const COLUMN_NAME_MAX_LENGTH = 100;
const COLUMN_COLOR_MAX_LENGTH = 20;

function normalizeColumnColor(color?: string) {
  return color && color.length <= COLUMN_COLOR_MAX_LENGTH
    ? color
    : DEFAULT_COLOR;
}


export interface NewColumnData {
  name: string;
  color: string;
}

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewColumnData) => void;
  initialData?: NewColumnData | null;
  title?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
}


export function AddColumnDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = "New column",
  submitLabel = "Add column",
  isSubmitting = false,
}: AddColumnDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [color, setColor] = useState<string>(
    normalizeColumnColor(initialData?.color),
  );

  const reset = () => {
    setName("");
    setColor(DEFAULT_COLOR);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit({ name: trimmed, color });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Column name */}
          <Input
            autoFocus
            placeholder="Column name…"
            value={name}
            maxLength={COLUMN_NAME_MAX_LENGTH}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") handleClose();
            }}
            className="text-sm"
          />

          {/* Color picker */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Color</p>
            <div className="flex items-center gap-2">
              {COLUMN_COLORS.map((c) => (
                <Button
                  key={c.value}
                  type="button"
                  variant="transparent"
                  size="icon-xs"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "size-6 rounded-full transition-all",
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                      : "opacity-60 hover:opacity-100",
                  )}
                  style={{
                    background: c.value,
                    ...(color === c.value ? { ringColor: c.value } : {}),
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div
                className="h-0.5 w-7 rounded-full"
                style={{ background: color }}
              />
              <span className="text-xs text-muted-foreground">
                {name || "Column name"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim()}
            isLoading={isSubmitting}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
