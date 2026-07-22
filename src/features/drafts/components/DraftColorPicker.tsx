import { useId } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DRAFT_COLORS } from "../constants";

interface DraftColorPickerProps {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (color: string) => void;
}

export function DraftColorPicker({
  value,
  error,
  disabled,
  onChange,
}: DraftColorPickerProps) {
  const colorId = useId();

  return (
    <div className="space-y-2">
      <Label id={colorId} className="text-sm font-bold text-foreground">
        Draft color<span className="text-destructive">*</span>
      </Label>
      <div
        role="radiogroup"
        aria-labelledby={colorId}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {DRAFT_COLORS.map((color) => {
          const isSelected = value === color.value;

          return (
            <Button
              key={color.value}
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "h-11 justify-start gap-2 px-3 text-sm font-bold",
                isSelected && "border-primary ring-2 ring-primary/25",
              )}
              onClick={() => onChange(color.value)}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full ring-1 ring-foreground/10",
                  color.swatchClassName,
                )}
              >
                {isSelected && (
                  <Check className="size-3 text-white" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 truncate">{color.name}</span>
            </Button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
