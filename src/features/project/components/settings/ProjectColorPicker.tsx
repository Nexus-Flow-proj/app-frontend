import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROJECT_COLORS } from "../../constants";

interface ProjectColorPickerProps {
  id: string;
  selectedColor: string;
  disabled?: boolean;
  error?: string;
  onChange: (color: string) => void;
}

export function ProjectColorPicker({
  id,
  selectedColor,
  disabled = false,
  error,
  onChange,
}: ProjectColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label id={id} className="text-xs font-bold text-foreground">
        Project color<span className="text-destructive">*</span>
      </Label>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="grid grid-cols-3 gap-2 sm:grid-cols-6"
      >
        {PROJECT_COLORS.map((color) => {
          const isSelected = selectedColor === color.value;

          return (
            <Button
              key={color.value}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "h-10 justify-start gap-2 px-2 text-xs",
                isSelected && "border-primary ring-2 ring-primary/25",
              )}
              onClick={() => onChange(color.value)}
            >
              <span
                className={cn(
                  "size-4 rounded-full ring-1 ring-foreground/10",
                  color.swatchClassName,
                )}
              />
              <span className="min-w-0 truncate">{color.name}</span>
            </Button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
