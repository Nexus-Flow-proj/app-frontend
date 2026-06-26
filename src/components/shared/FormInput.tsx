import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends Omit<ComponentProps<typeof Input>, "id"> {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  labelAction?: ReactNode;
  showPasswordToggle?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export function FormInput({
  id,
  label,
  error,
  required = false,
  leftIcon,
  rightIcon,
  labelAction,
  showPasswordToggle = false,
  wrapperClassName,
  labelClassName,
  inputClassName,
  className,
  type = "text",
  ...props
}: FormInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasLeftIcon = Boolean(leftIcon);
  const hasRightContent = Boolean(rightIcon) || showPasswordToggle;
  const inputType =
    showPasswordToggle && type === "password" && isPasswordVisible
      ? "text"
      : type;

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={inputId}
          className={cn("text-xs font-bold text-foreground", labelClassName)}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {labelAction}
      </div>

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
            {leftIcon}
          </span>
        )}

        <Input
          {...props}
          id={inputId}
          type={inputType}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={error ? errorId : props["aria-describedby"]}
          className={cn(
            "h-9 bg-background text-xs font-semibold",
            hasLeftIcon && "pl-9",
            hasRightContent && "pr-9",
            inputClassName,
            className,
          )}
        />

        {showPasswordToggle ? (
          <Button
            type="button"
            variant="transparent"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            tabIndex={-1}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        ) : (
          rightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
              {rightIcon}
            </span>
          )
        )}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
