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
  { label: "Purple",  value: "var(--primary)" },
  { label: "Blue",    value: "var(--chart-1)" },
  { label: "Teal",    value: "var(--chart-2)" },
  { label: "Green",   value: "var(--chart-3)" },
  { label: "Amber",   value: "var(--chart-4)" },
  { label: "Red",     value: "var(--chart-5)" },
] as const;

const DEFAULT_COLOR = COLUMN_COLORS[0].value;


export interface NewColumnData {
  name: string;
  color: string;
}

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewColumnData) => void;
}


export function AddColumnDialog({ isOpen, onClose, onSubmit }: AddColumnDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);

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
    if (!trimmed) return;
    onSubmit({ name: trimmed, color });
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">New column</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Column name */}
          <Input
            autoFocus
            placeholder="Column name…"
            value={name}
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
                <button
                  key={c.value}
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
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Add column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
